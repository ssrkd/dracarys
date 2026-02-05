import React, { useEffect, useState, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'

// Мемоизированный компонент карточки заказа для оптимизации производительности
const OrderCard = memo(({ order, index, onOpenModal, formatDate, sumItems, methodPrefix, methodLabel, mapStatus, t }) => {
  return (
    <div key={order.id} className="order-card" style={{
      background: '#FBFBFD', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 20, padding: 20,
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
      animation: `slideUp 0.4s ease ${index * 0.1}s backwards`
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'; e.currentTarget.style.background = '#FFFFFF' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#FBFBFD' }}>
      {/* Thumbnail */}
      <div className="order-thumbnail" style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)' }}>
        {Array.isArray(order.items) && order.items[0]?.image_url ? (
          <img src={order.items[0].image_url} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868B', fontSize: '24px' }}>📦</div>
        )}
      </div>
      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: '#1D1D1F', fontSize: 17, letterSpacing: '-0.3px', marginBottom: 4 }}>{t('history.order_no')}{order.id}</div>
        <div style={{ fontSize: 14, color: '#86868B', marginBottom: 4, fontWeight: 500 }}>{formatDate(order.created_at)}</div>
        <div style={{ fontSize: 14, color: '#86868B', fontWeight: 400 }}>
          {t('history.items_count')} {sumItems(order.items)} • {methodPrefix(order.delivery_method)}: {methodLabel(order.delivery_method)}
        </div>
      </div>
      {/* Total + status */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ fontWeight: 700, color: '#000000', fontSize: 20, letterSpacing: '-0.5px' }}>{Number(order.total_amount || 0).toLocaleString('ru-RU')} ₸</div>
        <div style={{
          fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 8,
          background: order.status === 'issued' ? 'rgba(52, 199, 89, 0.1)' : order.status === 'canceled' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 122, 255, 0.1)',
          color: order.status === 'issued' ? '#34C759' : order.status === 'canceled' ? '#FF3B30' : '#007AFF'
        }}>{mapStatus(order.status)}</div>
        <button onClick={() => onOpenModal(order)} style={{
          padding: '8px 16px', borderRadius: 12, border: 'none', background: '#F5F5F7', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#1D1D1F',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => { e.target.style.background = '#E5E5EA'; e.target.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.target.style.background = '#F5F5F7'; e.target.style.transform = 'scale(1)' }}>
          {t('history.details')}
        </button>
      </div>
    </div>
  )
})

export default function History({ customer }) {
  const { t, lang, setLang } = useLang()
  usePageTitle(t('history.title'))
  const navigate = useNavigate()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOrder, setModalOrder] = useState(null)
  const [modalEvents, setModalEvents] = useState([])
  const [cancelReason, setCancelReason] = useState('')

  // Пагинация для производительности
  const [displayedOrders, setDisplayedOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const ORDERS_PER_PAGE = 10 // Показываем по 10 заказов за раз

  // Header states
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' }) // Force instant scroll
    setTimeout(() => window.scrollTo(0, 0), 50)  // Double check
    setHydrated(true)
    fetchOrders()
  }, [])

  // Обновляем отображаемые заказы при изменении списка заказов или страницы
  useEffect(() => {
    updateDisplayedOrders()
  }, [orders, currentPage])

  const fetchOrders = async () => {
    if (!customer?.id) {
      setOrders([])
      setDisplayedOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      const ordersArray = Array.isArray(data) ? data : []
      setOrders(ordersArray)
    } catch (e) {
      console.error('Ошибка загрузки заказов:', e)
      setOrders([])
      setDisplayedOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayedOrders = () => {
    const startIndex = 0
    const endIndex = currentPage * ORDERS_PER_PAGE
    const newDisplayedOrders = orders.slice(startIndex, endIndex)
    setDisplayedOrders(newDisplayedOrders)
    setHasMore(endIndex < orders.length)
  }

  const loadMoreOrders = () => {
    setCurrentPage(prev => prev + 1)
  }

  const formatDate = (s) => {
    if (!s) return ''
    try {
      const d = new Date(s)
      return d.toLocaleString(lang === 'kk' ? 'kk-KZ' : (lang === 'en' ? 'en-US' : 'ru-RU'), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch { return s }
  }

  const sumItems = (items) => {
    try { return (items || []).reduce((a, i) => a + Number(i.qty || 0), 0) } catch { return 0 }
  }

  const mapStatus = (s) => {
    switch (s) {
      case 'created': return t('history.status.created')
      case 'accepted': return t('history.status.accepted')
      case 'packing': return t('history.status.packing')
      case 'ready': return t('history.status.ready')
      case 'issued': return t('history.status.issued')
      case 'canceled': return t('history.status.canceled')
      default: return s || t('history.status.created')
    }
  }

  const methodLabel = (m) => {
    switch (m) {
      case 'kz': return t('history.delivery.method_kz')
      case 'city': return t('history.delivery.method_city')
      case 'store': return t('history.delivery.method_store')
      default: return t('history.delivery.method_pickup')
    }
  }
  const methodPrefix = (m) => (m === 'kz' || m === 'city') ? t('history.delivery.prefix_delivery') : t('history.delivery.prefix_pickup')

  const openModal = async (order) => {
    setModalOrder(order)
    setModalOpen(true)
    try {
      const { data, error } = await supabase
        .from('order_status_events')
        .select('id, status, seller_name, created_at, cancel_reason')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true })
      const list = (!error && Array.isArray(data)) ? data : []
      setModalEvents(list)

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
    } catch (_) {
      setModalEvents([])
      setCancelReason('')
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .home-header-container { padding: 16px 20px !important; }
          .home-logo { height: 36px !important; }
          .home-logo-title { font-size: 15px !important; }
          .home-logo-subtitle { font-size: 11px !important; }
          .history-content { padding: 100px 20px 80px !important; }
          .order-card { 
            padding: 16px !important; 
            transition: none !important; /* Убираем анимации на мобильных */
          }
          .order-thumbnail { 
            width: 48px !important; 
            height: 48px !important; 
            transition: none !important; /* Убираем анимации на мобильных */
          }
          /* Убираем hover эффекты на мобильных устройствах */
          .order-card:hover {
            transform: none !important;
            box-shadow: none !important;
            background: #FBFBFD !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        {/* Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease'
        }}>
          <div className="home-header-container" style={{
            maxWidth: '1440px', margin: '0 auto', padding: '20px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div className="home-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'opacity 0.3s ease', opacity: 1 }}
              onClick={() => navigate('/storedashboard')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <img src={logoQaraa} alt="qaraa" className="home-logo" style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div className="home-logo-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: '1' }}>qaraa.kz</div>
                <div className="home-logo-subtitle" style={{ fontSize: '12px', color: '#8E8E93', marginTop: '4px' }}>{t('nav.ecosystem_slogan')}</div>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                  position: 'relative',
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
                        }}>
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
                  className="mobile-profile-menu"
                  style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E5E5EA',
                    borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    minWidth: '180px',
                    padding: '8px 0',
                    zIndex: 1000,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/history') }}
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
                    {t('nav.my_orders')}
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
                      color: '#1C1C1E',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('nav.cart')}
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/track') }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1C1C1E',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('nav.track_order')}
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
                    {t('profile.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="history-content" style={{ paddingTop: '120px', padding: '120px 48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
          {
            loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }} >
                <div style={{ width: 44, height: 44, border: '3px solid #F5F5F7', borderTopColor: '#000000', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: '17px', color: '#86868B', fontWeight: 500 }}>{t('history.loading')}</div>
              </div >
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '120px 20px', animation: 'fadeIn 0.8s ease' }}>
                <div style={{ fontSize: '72px', marginBottom: '24px', opacity: 0.5 }}>📭</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#1D1D1F', marginBottom: '12px', letterSpacing: '-0.5px' }}>{t('history.empty_title')}</div>
                <div style={{ fontSize: '17px', color: '#86868B', fontWeight: 400, maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>{t('history.empty_desc')}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.6s ease 0.2s backwards' }}>
                {displayedOrders.map((order, idx) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={idx}
                    onOpenModal={openModal}
                    formatDate={formatDate}
                    sumItems={sumItems}
                    methodPrefix={methodPrefix}
                    methodLabel={methodLabel}
                    mapStatus={mapStatus}
                    t={t}
                  />
                ))}

                {/* Кнопка "Загрузить еще" */}
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button
                      onClick={loadMoreOrders}
                      style={{
                        padding: '12px 24px',
                        background: '#F5F5F7',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#1D1D1F',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#E5E5EA'
                        e.target.style.transform = 'scale(1.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#F5F5F7'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      {t('history.show_more')} ({orders.length - displayedOrders.length})
                    </button>
                  </div>
                )}
              </div>
            )}
        </div >
        {/* Modal */}
        {
          modalOpen && modalOrder && (
            <div onClick={() => { setModalOpen(false); setModalOrder(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: '92%', maxWidth: 560, background: '#FFFFFF', borderRadius: 28, boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)', padding: 32, animation: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.5px' }}>{t('history.order_no')}{modalOrder.id}</div>
                  <button onClick={() => { setModalOpen(false); setModalOrder(null) }} style={{ width: 32, height: 32, border: 'none', background: '#F5F5F7', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#86868B', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.target.style.background = '#E5E5EA'; e.target.style.transform = 'scale(1.1)' }}
                    onMouseLeave={(e) => { e.target.style.background = '#F5F5F7'; e.target.style.transform = 'scale(1)' }}>×</button>
                </div>
                <div style={{ fontSize: 15, color: '#86868B', marginBottom: 20, fontWeight: 500 }}>{formatDate(modalOrder.created_at)} • {methodPrefix(modalOrder.delivery_method)}: {methodLabel(modalOrder.delivery_method)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {Array.isArray(modalOrder.items) && modalOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#F5F5F7', borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.04)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name || t('common.item')}</div>
                        {it.barcode && (
                          <div style={{
                            fontSize: 11,
                            color: '#86868B',
                            fontFamily: 'SF Mono, monospace',
                            letterSpacing: '0.5px'
                          }}>
                            {it.barcode}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: '#86868B', fontWeight: 500 }}>x{Number(it.qty || 0)}</div>
                      <div style={{ fontSize: 14, color: '#86868B', fontWeight: 400 }}>{it.size ? `${it.size}` : ''}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F5F5F7', borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.04)' }}>
                  <div style={{ fontSize: 15, color: '#86868B', fontWeight: 500 }}>{t('common.status')}: <span style={{
                    color: modalOrder.status === 'issued' ? '#34C759' : modalOrder.status === 'canceled' ? '#FF3B30' : '#007AFF',
                    fontWeight: 600
                  }}>{mapStatus(modalOrder.status)}</span></div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#000000', letterSpacing: '-0.5px' }}>{Number(modalOrder.total_amount || 0).toLocaleString(lang === 'kk' ? 'kk-KZ' : (lang === 'en' ? 'en-US' : 'ru-RU'))} ₸</div>
                </div>
                {modalOrder.status === 'canceled' && (
                  <div style={{ marginTop: 16, padding: '16px 20px', background: 'rgba(255, 59, 48, 0.08)', borderRadius: 12, border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                    <div style={{ fontSize: 14, color: '#FF3B30', fontWeight: 600 }}>{t('history.reason')} {cancelReason || '—'}</div>
                  </div>
                )}
                {modalEvents.length > 0 && (
                  <div style={{ marginTop: 16, padding: '16px 20px', background: '#F5F5F7', borderRadius: 12, border: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    {(() => {
                      const last = modalEvents[modalEvents.length - 1]
                      const when = formatDate(last.created_at)
                      const who = last.seller_name || '—'
                      return <div style={{ fontSize: 14, color: '#86868B', fontWeight: 500 }}>{t('history.last_action')} <span style={{ fontWeight: 600, color: '#1D1D1F' }}>{mapStatus(last.status)}</span> • {when} • {who}</div>
                    })()}
                  </div>
                )}
              </div>
            </div>
          )
        }

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
                  animation: 'slideUp 0.3s ease-out'
                }}
              >
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1D1D1F',
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  {t('profile.logout_confirm_title')}
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#86868B',
                  lineHeight: 1.4,
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {t('profile.logout_confirm_msg')}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: '#F2F2F7',
                      color: '#1D1D1F',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E5EA'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F2F2F7'}
                  >
                    {t('cart.confirm_cancel')}
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      background: '#FF3B30',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E6342A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FF3B30'}
                  >
                    {t('profile.logout')}
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
