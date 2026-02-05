import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'

export default function TrackOrder() {
  const { t, lang, setLang } = useLang()
  usePageTitle(t('nav.track_order') || 'Отслежка')
  const navigate = useNavigate()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [events, setEvents] = useState([])
  const [evLoading, setEvLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    try { localStorage.removeItem('qaraa_customer') } catch (_) { }
    try {
      window.location.href = '/'
    } catch (_) {
      navigate('/')
    }
  }

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.mobile-profile-menu') && !event.target.closest('.mobile-profile-btn')) {
        setProfileMenuOpen(false)
      }
      if (langMenuOpen && !event.target.closest('.lang-selector-container')) {
        setLangMenuOpen(false)
      }
    }

    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [profileMenuOpen, langMenuOpen])

  useEffect(() => {
    try {
      const tryKeys = ['qaraa_customer', 'customer']
      for (const k of tryKeys) {
        const saved = localStorage.getItem(k)
        if (!saved) continue
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.id != null && !customerId) setCustomerId(Number(parsed.id))
          if (parsed?.phone && !customerPhone) setCustomerPhone(String(parsed.phone))
        } catch (_) { }
      }
    } catch (e) { }
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const t = setTimeout(() => window.scrollTo(0, 0), 50);
    return () => clearTimeout(t);
  }, []);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString('ru-RU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      })
    } catch (_) { return iso || '' }
  }

  const sumItems = (items) => Array.isArray(items)
    ? items.reduce((s, it) => s + Number(it.qty || 0), 0)
    : 0

  const methodLabel = (m) => {
    switch (m) {
      case 'kz': return t('history.delivery.method_kz') || 'по KZ'
      case 'city': return t('history.delivery.method_city') || 'по городу'
      case 'store': return t('history.delivery.method_store') || 'в магазине'
      case 'pickup': return t('history.delivery.method_pickup') || 'самовывоз'
      default: return m || ''
    }
  }

  const mapStatus = (s) => {
    switch (s) {
      case 'new':
      case 'created': return t('history.status.created') || 'Создан'
      case 'accepted': return t('history.status.accepted') || 'Принято'
      case 'packing': return t('history.status.packing') || 'Упаковка'
      case 'ready': return t('history.status.ready') || 'Готово'
      case 'issued': return t('history.status.issued') || 'Выдано'
      case 'canceled': return t('history.status.canceled') || 'Отменён'
      default: return s || t('common.status')
    }
  }

  const shallowEqualOrders = (a = [], b = []) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = b[i]
      if (!x || !y) return false
      if (x.id !== y.id) return false
      if (x.status !== y.status) return false
      if (x.delivery_method !== y.delivery_method) return false
      if (x.created_at !== y.created_at) return false
      if (x.total_amount !== y.total_amount) return false
    }
    return true
  }

  const fetchOrders = async (cid, { silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, items, total_amount, delivery_method, status, created_at')
        .eq('customer_id', cid)
        .neq('status', 'canceled')
        .neq('status', 'issued')
        .order('created_at', { ascending: false })
      if (error) throw error
      let list = Array.isArray(data) ? data : []
      // fallback: если пусто и известен телефон — искать по contact.phone и address_json.phone (ilike)
      if ((list.length === 0 || cid == null) && customerPhone) {
        try {
          const digits = String(customerPhone).replace(/\D/g, '')
          const tail9 = digits.slice(-9)
          const patt = tail9 ? `%${tail9}` : `%${digits}`
          // по contact->>phone
          const { data: byContact, error: e2 } = await supabase
            .from('orders')
            .select('id, items, total_amount, delivery_method, status, created_at')
            .ilike('contact->>phone', patt)
            .neq('status', 'canceled')
            .neq('status', 'issued')
            .order('created_at', { ascending: false })
          if (!e2 && Array.isArray(byContact) && byContact.length) {
            list = byContact
          } else {
            // по address_json->>phone
            const { data: byAddr, error: e3 } = await supabase
              .from('orders')
              .select('id, items, total_amount, delivery_method, status, created_at')
              .ilike('address_json->>phone', patt)
              .neq('status', 'canceled')
              .neq('status', 'issued')
              .order('created_at', { ascending: false })
            if (!e3 && Array.isArray(byAddr)) list = byAddr
          }
        } catch (_) { }
      }
      setOrders(prev => (silent && shallowEqualOrders(prev, list)) ? prev : list)
      return list
    } catch (e) {
      if (!silent) setOrders([])
      return []
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const shallowEqualEvents = (a = [], b = []) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = b[i]
      if (!x || !y) return false
      if (x.id !== y.id) return false
      if (x.status !== y.status) return false
      if (x.seller_name !== y.seller_name) return false
      if (x.created_at !== y.created_at) return false
    }
    return true
  }

  const fetchEvents = async (orderId, { silent = false } = {}) => {
    if (!silent) setEvLoading(true)
    try {
      const { data, error } = await supabase
        .from('order_status_events')
        .select('id, status, seller_name, created_at, cancel_reason')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })
      if (error) throw error
      const list = Array.isArray(data) ? data : []
      setEvents(prev => (silent && shallowEqualEvents(prev, list)) ? prev : list)

      // Ищем последнюю отмену и берем причину из нового столбца cancel_reason
      const lastCanceled = list.filter(e => e.status === 'canceled').slice(-1)[0]
      if (lastCanceled?.cancel_reason) {
        setCancelReason(String(lastCanceled.cancel_reason))
      } else if (lastCanceled?.created_at) {
        // Fallback: если в новом столбце нет данных, пробуем старый способ через sales
        try {
          const { data: srow } = await supabase
            .from('sales')
            .select('return_reason')
            .eq('returned_at', lastCanceled.created_at)
            .maybeSingle()
          setCancelReason((srow && srow.return_reason) ? String(srow.return_reason) : '')
        } catch (_) { setCancelReason('') }
      } else {
        setCancelReason('')
      }
    } catch (e) {
      if (!silent) setEvents([])
    } finally {
      if (!silent) setEvLoading(false)
    }
  }

  useEffect(() => {
    if (customerId != null) fetchOrders(customerId, { silent: false })
  }, [customerId])

  useEffect(() => {
    if (selected?.id != null) fetchEvents(selected.id, { silent: false })
  }, [selected?.id])

  // Автообновление каждые 3 секунды
  useEffect(() => {
    if (customerId == null) return
    const tick = async () => {
      const list = await fetchOrders(customerId, { silent: true })
      if (selected?.id && !list.find(o => o.id === selected.id)) {
        setSelected(null)
        setEvents([])
      } else if (selected?.id) {
        await fetchEvents(selected.id, { silent: true })
      }
    }
    const t = setInterval(tick, 3000)
    return () => clearInterval(t)
  }, [customerId, selected?.id])

  // Убраны клиентские подтверждения оплаты. Управление остатками — только у продавца на «Принято».

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .track-header-container { 
            padding: 12px 16px !important; 
            min-height: 60px !important;
          }
          .track-logo { height: 32px !important; }
          .track-logo-title { font-size: 14px !important; font-weight: 700 !important; }
          .track-logo-subtitle { font-size: 10px !important; }
          
          .track-main { 
            padding: 120px 16px 40px !important; 
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .track-title { 
            font-size: 32px !important; 
            margin-bottom: 8px !important;
            letter-spacing: -1px !important;
          }
          .track-description { 
            font-size: 15px !important; 
            margin-bottom: 20px !important;
            line-height: 1.4 !important;
          }
          
          .track-card { 
            border-radius: 16px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
          }
          .track-card:hover {
            transform: none !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
          }
          
          .track-order-item {
            padding: 16px !important;
            margin-bottom: 2px !important;
          }
          .track-order-item:last-child {
            margin-bottom: 0 !important;
          }
          .track-order-title {
            font-size: 16px !important;
            line-height: 1.2 !important;
          }
          .track-order-meta {
            font-size: 13px !important;
            line-height: 1.3 !important;
          }
          
          /* Mobile Profile Menu */
          .mobile-profile-btn {
            width: 36px !important;
            height: 36px !important;
            font-size: 18px !important;
          }
          .mobile-profile-menu {
            right: 0 !important;
            top: 44px !important;
            min-width: 160px !important;
            border-radius: 12px !important;
          }
          
          /* Mobile Cards Content */
          .track-card-header {
            padding: 16px 20px !important;
            font-size: 18px !important;
          }
          .track-card-content {
            padding: 20px !important;
          }
          
          /* Mobile Smooth Scrolling */
          .track-orders-scroll {
            max-height: 60vh !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
            padding-bottom: 10px !important;
            position: relative !important;
          }
          .track-orders-scroll::-webkit-scrollbar {
            width: 4px !important;
            background: transparent !important;
          }
          .track-orders-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05) !important;
            border-radius: 2px !important;
            margin: 4px 0 !important;
          }
          .track-orders-scroll::-webkit-scrollbar-thumb {
            background: rgba(0, 122, 255, 0.4) !important;
            border-radius: 2px !important;
            transition: all 0.2s ease !important;
          }
          .track-orders-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 122, 255, 0.6) !important;
          }
          .track-orders-scroll::-webkit-scrollbar-thumb:active {
            background: rgba(0, 122, 255, 0.8) !important;
          }
          
          /* Scroll fade indicators */
          .track-orders-scroll::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 20px !important;
            background: linear-gradient(to bottom, rgba(251, 251, 253, 1) 0%, rgba(251, 251, 253, 0) 100%) !important;
            pointer-events: none !important;
            z-index: 1 !important;
          }
          .track-orders-scroll::after {
            content: '' !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 20px !important;
            background: linear-gradient(to top, rgba(251, 251, 253, 1) 0%, rgba(251, 251, 253, 0) 100%) !important;
            pointer-events: none !important;
            z-index: 1 !important;
          }
          
          /* Mobile Order Details */
          .track-order-detail-header {
            padding: 12px 16px !important;
            font-size: 16px !important;
            margin-bottom: 16px !important;
          }
          .track-event-item {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 12px 16px !important;
          }
          .track-event-time {
            font-size: 12px !important;
            margin-bottom: 4px !important;
          }
          .track-event-status {
            font-size: 15px !important;
          }
          .track-event-seller {
            font-size: 13px !important;
          }
          
          /* Mobile Empty States */
          .track-empty-state {
            padding: 40px 20px !important;
          }
          .track-empty-icon {
            font-size: 40px !important;
            margin-bottom: 12px !important;
          }
          .track-empty-title {
            font-size: 16px !important;
            margin-bottom: 6px !important;
          }
          .track-empty-text {
            font-size: 14px !important;
          }
          
          /* Mobile-specific empty state for order details */
          .track-empty-state-mobile {
            display: block !important;
          }
          .track-empty-state-desktop {
            display: none !important;
          }
          
          /* Mobile Loading States */
          .track-loading {
            padding: 40px 20px !important;
          }
          .track-loading-spinner {
            width: 24px !important;
            height: 24px !important;
            margin-bottom: 12px !important;
          }
          .track-loading-text {
            font-size: 14px !important;
          }
        }
        
        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .track-main {
            padding: 70px 12px 30px !important;
            gap: 16px !important;
          }
          .track-title {
            font-size: 28px !important;
          }
          .track-description {
            font-size: 14px !important;
          }
          .track-card {
            border-radius: 12px !important;
          }
          .track-order-item {
            padding: 12px !important;
          }
          .track-order-title {
            font-size: 15px !important;
          }
          .track-order-meta {
            font-size: 12px !important;
          }
          .track-card-header {
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          .track-card-content {
            padding: 16px !important;
          }
          .track-orders-scroll {
            max-height: 50vh !important;
          }
        }
        
        /* Momentum scrolling for iOS */
        .track-orders-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
        }
        
        /* Enhanced touch scrolling */
        @supports (-webkit-overflow-scrolling: touch) {
          .track-orders-scroll {
            transform: translateZ(0);
            will-change: scroll-position;
          }
        }
        
        /* Desktop empty state styles */
        @media (min-width: 769px) {
          .track-empty-state-mobile {
            display: none !important;
          }
          .track-empty-state-desktop {
            display: block !important;
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          .track-card:hover { transform: none !important; }
          .track-card:active { 
            transform: scale(0.98) !important;
            transition: transform 0.1s ease !important;
          }
          .track-order-item:hover { transform: none !important; }
          .track-order-item:active {
            transform: scale(0.98) !important;
            transition: transform 0.1s ease !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        {/* Fixed Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease'
        }}>
          <div className="home-header-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/storedashboard')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'opacity 0.3s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onTouchStart={(e) => e.currentTarget.style.opacity = '0.7'}
              onTouchEnd={(e) => e.currentTarget.style.opacity = '1'}>
              <img src={logoQaraa} alt="qaraa" className="home-logo" style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div className="home-logo-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: 1 }}>qaraa.kz</div>
                <div className="home-logo-subtitle" style={{ fontSize: '12px', color: '#8E8E93', marginTop: 4 }}>{t('nav.ecosystem_slogan') || 'Безопасная экосистема'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
              {/* Desktop/Mobile Smart Language Selector pill in Header */}
              <div
                className="lang-selector-container"
                onMouseEnter={() => setLangMenuOpen(true)}
                onMouseLeave={() => setLangMenuOpen(false)}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{
                  background: 'rgba(0, 0, 0, 0.03)',
                  padding: '4px',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  width: langMenuOpen ? '92px' : '32px', // Fixed width for reliability
                  height: '32px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  position: 'relative'
                }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  position: langMenuOpen ? 'relative' : 'absolute',
                  left: langMenuOpen ? '0' : '50%',
                  transform: langMenuOpen ? 'none' : 'translateX(-50%)',
                  padding: langMenuOpen ? '0 4px' : '0'
                }}>
                  {['kk', 'ru', 'en'].map(l => {
                    const isActive = lang === l;
                    if (!langMenuOpen && !isActive) return null;

                    return (
                      <button
                        key={l}
                        onClick={(e) => {
                          if (!isActive) {
                            e.stopPropagation();
                            setLang(l);
                            setLangMenuOpen(false);
                          }
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? '#FFFFFF' : '#1D1D1F',
                          background: isActive ? '#000000' : 'transparent',
                          transition: 'all 0.3s ease',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          border: 'none',
                          padding: 0,
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="Меню"
                className="mobile-profile-btn"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '24px',
                  color: '#1D1D1F',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '2px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
                onTouchStart={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'scale(0.95)' }}
                onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
                ⋯
              </button>
              {profileMenuOpen && (
                <div
                  onMouseLeave={() => setProfileMenuOpen(false)}
                  onClick={(e) => e.stopPropagation()}
                  className="mobile-profile-menu"
                  style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E5E5EA',
                    borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    minWidth: '180px',
                    zIndex: 200,
                    animation: 'scaleIn 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/history') }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1D1D1F',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('nav.my_orders') || 'Мои заказы'}
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/cart') }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1D1D1F',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('nav.cart') || 'Корзина'}
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/track') }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0, 122, 255, 0.1)',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#007AFF',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {t('nav.track_order') || 'Отследить заказ'}
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      setShowLogoutConfirm(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#FF3B30',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('profile.logout') || 'Выйти'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="track-main" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '240px 24px 40px', // Very aggressive top padding to satisfy user
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          animation: 'fadeIn 0.8s ease'
        }
        }>
          {/* Title Section */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '32px' }}>
            <h1 className="track-title" style={{
              fontSize: '48px',
              fontWeight: '800',
              letterSpacing: '-2px',
              marginBottom: '12px',
              color: '#000000',
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
            }}>{t('track.title') || 'Отследить заказ'}</h1>
            <p className="track-description" style={{
              fontSize: '19px',
              color: '#86868B',
              marginBottom: 0,
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: '640px',
              letterSpacing: '-0.2px'
            }}>
              {t('track.description') || 'Следите за статусом ваших активных заказов в реальном времени'}
            </p>
          </div >

          {/* Orders List */}
          < div className="track-card" style={{
            background: '#FBFBFD',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'slideUp 0.6s ease 0.1s backwards'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.background = '#FFFFFF' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#FBFBFD' }}>
            <div className="track-card-header" style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F2F2F7',
              fontSize: '20px',
              fontWeight: '700',
              color: '#1D1D1F',
              letterSpacing: '-0.5px'
            }}>
              {t('track.my_orders') || 'Мои заказы'}
            </div>
            <div className="track-orders-scroll" style={{ maxHeight: '500px', overflow: 'auto', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
              {loading ? (
                <div className="track-loading" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <div className="track-loading-spinner" style={{ width: 32, height: 32, border: '3px solid #F5F5F7', borderTopColor: '#007AFF', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
                  <div className="track-loading-text" style={{ fontSize: '15px', color: '#86868B', fontWeight: 500 }}>{t('track.loading_orders') || 'Загрузка заказов...'}</div>
                </div>
              ) : orders.length === 0 ? (
                <div className="track-empty-state" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <div className="track-empty-icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
                  <div className="track-empty-title" style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', marginBottom: '8px' }}>{t('track.empty_title') || 'Нет активных заказов'}</div>
                  <div className="track-empty-text" style={{ fontSize: '15px', color: '#86868B', fontWeight: 400 }}>{t('track.empty_desc') || 'Активные заказы появятся здесь'}</div>
                </div>
              ) : (
                orders.map((o, idx) => (
                  <div
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="track-order-item"
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid #F2F2F7',
                      cursor: 'pointer',
                      background: selected?.id === o.id ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                      transition: 'all 0.3s ease',
                      animation: `slideUp 0.4s ease ${idx * 0.1}s backwards`
                    }}
                    onMouseEnter={(e) => { if (selected?.id !== o.id) e.currentTarget.style.background = 'rgba(0, 122, 255, 0.04)' }}
                    onMouseLeave={(e) => { if (selected?.id !== o.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="track-order-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.3px' }}>
                        {t('common.order_no')} №{o.id}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#86868B',
                        fontWeight: 500,
                        textAlign: 'right',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", monospace'
                      }}>
                        {formatDate(o.created_at)}
                      </div>
                    </div>
                    <div className="track-order-meta" style={{ fontSize: '14px', color: '#86868B', marginBottom: '4px', fontWeight: 500 }}>
                      {t('history.items_count')} {sumItems(o.items)} • {Number(o.total_amount || 0).toLocaleString('ru-RU')} ₸
                    </div>
                    <div style={{ fontSize: '14px', color: '#86868B', marginBottom: '8px', fontWeight: 400 }}>
                      {t('common.delivery_label')}: {methodLabel(o.delivery_method)}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      background: o.status === 'ready' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(0, 122, 255, 0.1)',
                      color: o.status === 'ready' ? '#34C759' : '#007AFF'
                    }}>
                      {mapStatus(o.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div >

          {/* Order Details */}
          < div className="track-card" style={{
            background: '#FBFBFD',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '20px',
            minHeight: '400px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'slideUp 0.6s ease 0.2s backwards'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.background = '#FFFFFF' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#FBFBFD' }}>
            <div className="track-card-header" style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F2F2F7',
              fontSize: '20px',
              fontWeight: '700',
              color: '#1D1D1F',
              letterSpacing: '-0.5px'
            }}>
              {t('track.status_history') || 'История статусов'}
            </div>
            {
              !selected ? (
                <div className="track-empty-state" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  {/* Десктопная версия */}
                  <div className="track-empty-state-desktop">
                    <div className="track-empty-icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👈</div>
                    <div className="track-empty-title" style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', marginBottom: '8px' }}>{t('track.select_order_title') || 'Выберите заказ'}</div>
                    <div className="track-empty-text" style={{ fontSize: '15px', color: '#86868B', fontWeight: 400, lineHeight: 1.5 }}>
                      {t('track.select_order_desc_desktop') || 'Выберите заказ слева, чтобы увидеть подробно историю статусов'}
                    </div>
                  </div>

                  {/* Мобильная версия */}
                  <div className="track-empty-state-mobile" style={{ display: 'none' }}>
                    <div className="track-empty-icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👆</div>
                    <div className="track-empty-title" style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', marginBottom: '8px' }}>{t('track.select_order_title') || 'Выберите заказ'}</div>
                    <div className="track-empty-text" style={{ fontSize: '15px', color: '#86868B', fontWeight: 400, lineHeight: 1.5 }}>
                      {t('track.select_order_desc_mobile') || 'Выберите заказ выше, чтобы увидеть подробно историю статусов'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="track-card-content" style={{ padding: '24px' }}>
                  <div className="track-order-detail-header" style={{
                    marginBottom: '20px',
                    padding: '16px 20px',
                    background: 'rgba(0, 122, 255, 0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 122, 255, 0.1)'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1D1D1F', marginBottom: '4px', letterSpacing: '-0.3px' }}>
                      {t('common.order_no')} №{selected.id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#86868B', fontWeight: 500 }}>
                      {formatDate(selected.created_at)} • {methodLabel(selected.delivery_method)}
                    </div>
                  </div>

                  {evLoading ? (
                    <div className="track-loading" style={{ padding: '40px 0', textAlign: 'center' }}>
                      <div className="track-loading-spinner" style={{ width: 24, height: 24, border: '2px solid #F5F5F7', borderTopColor: '#007AFF', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                      <div className="track-loading-text" style={{ fontSize: '14px', color: '#86868B', fontWeight: 500 }}>{t('track.loading_history') || 'Загрузка истории...'}</div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="track-empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>
                      <div className="track-empty-icon" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>⏳</div>
                      <div className="track-empty-title" style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F', marginBottom: '6px' }}>{t('track.no_events_title') || 'Пока нет событий'}</div>
                      <div className="track-empty-text" style={{ fontSize: '14px', color: '#86868B', fontWeight: 400 }}>{t('track.no_events_desc') || 'История появится здесь'}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {events.map((ev, idx) => (
                        <div
                          key={ev.id}
                          className="track-event-item"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr',
                            gap: '16px',
                            alignItems: 'flex-start',
                            padding: '16px 20px',
                            background: '#F8F9FA',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 0, 0, 0.04)',
                            animation: `slideUp 0.3s ease ${idx * 0.1}s backwards`
                          }}
                        >
                          <div className="track-event-time" style={{
                            fontVariantNumeric: 'tabular-nums',
                            color: '#86868B',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", monospace',
                            lineHeight: 1.4
                          }}>
                            {formatDate(ev.created_at)}
                          </div>
                          <div>
                            <div className="track-event-status" style={{
                              fontSize: '16px',
                              fontWeight: '700',
                              color: '#1D1D1F',
                              marginBottom: '4px',
                              letterSpacing: '-0.2px'
                            }}>
                              {mapStatus(ev.status)}
                            </div>
                            <div className="track-event-seller" style={{ fontSize: '14px', color: '#86868B', fontWeight: 500 }}>
                              {ev.seller_name || t('common.system')}
                            </div>
                            {ev.status === 'canceled' && cancelReason && (
                              <div style={{
                                fontSize: '13px',
                                color: '#FF3B30',
                                marginTop: '6px',
                                padding: '6px 10px',
                                background: 'rgba(255, 59, 48, 0.08)',
                                borderRadius: '6px',
                                fontWeight: 500
                              }}>
                                {t('common.reason')}: {cancelReason}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          </div >
        </main >

        {/* Logout confirmation modal */}
        {
          showLogoutConfirm && (
            <div
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  maxWidth: '340px',
                  width: '100%',
                  animation: 'scaleIn 0.3s ease-out'
                }}
              >
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  {t('profile.logout_confirm_title') || 'Выйти из аккаунта?'}
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#86868B',
                  lineHeight: '1.5',
                  marginBottom: '28px',
                  fontWeight: '400'
                }}>
                  {t('profile.logout_confirm_msg') || 'Вы уверены, что хотите выйти? Вам придется снова войти в систему.'}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#F2F2F7',
                      color: '#000000',
                      fontSize: '16px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#FF3B30',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {t('profile.logout') || 'Выйти'}
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </>
  )
}

