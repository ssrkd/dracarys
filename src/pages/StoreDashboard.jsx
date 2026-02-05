import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'
import './Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import kaspiLogo from '../images/kaspi.svg'
import halykLogo from '../images/halyk.svg'
import cashLogo from '../images/cash.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'

export default function Dashboard() {
  const { t, lang, setLang } = useLang()
  usePageTitle(t('nav.profile') || 'Каталог')
  const navigate = useNavigate()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [sizeModalOpen, setSizeModalOpen] = useState(false)
  const [sizeProduct, setSizeProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const cartBtnRef = useRef(null)
  const [todaySellers, setTodaySellers] = useState([])
  const [scheduleErr, setScheduleErr] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => {
    try { localStorage.removeItem('qaraa_customer') } catch (_) { }
    try {
      window.location.href = '/'
    } catch (_) {
      navigate('/')
    }
  }

  const addToCart = (product) => {
    if (product.hasSizes) {
      setSizeProduct(product)
      setSelectedSize(null)
      setSizeModalOpen(true)
      return
    }
    addToCartDirect(product, null)
  }

  const addToCartDirect = (product, size) => {
    try {
      const raw = localStorage.getItem('qaraa_cart')
      const current = raw ? JSON.parse(raw) : []
      const maxQty = (() => {
        if (!size) return 99
        const found = (product.visibleSizes || []).find(v => v.size === size)
        return found?.qty ?? 1
      })()

      // агрегируем по id+size
      let merged = Array.isArray(current) ? [...current] : []
      const idx = merged.findIndex(it => it.id === product.id && (it.size || null) === (size || null))
      if (idx >= 0) {
        const nextQty = Math.min((merged[idx].qty || 1) + 1, merged[idx].maxQty || maxQty)
        merged[idx] = { ...merged[idx], qty: nextQty, maxQty: merged[idx].maxQty || maxQty }
      } else {
        merged.push({
          id: product.id,
          name: product.name,
          image_url: product.image_url,
          price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
          size: size || null,
          qty: 1,
          maxQty
        })
      }
      const updated = merged
      localStorage.setItem('qaraa_cart', JSON.stringify(updated))
      const totalCount = updated.reduce((sum, it) => sum + (it.qty || 1), 0)
      setCartCount(totalCount)
      animateToCart(product.id)
    } catch (e) {
      // ignore
    }
  }

  const confirmSizeAndAdd = () => {
    if (!sizeProduct || !selectedSize) return
    addToCartDirect(sizeProduct, selectedSize)
    setSizeModalOpen(false)
    setSizeProduct(null)
    setSelectedSize(null)
  }

  const animateToCart = (productId) => {
    try {
      const imgEl = document.getElementById(`product-img-${productId}`)
      const cartEl = cartBtnRef.current
      if (!imgEl || !cartEl) return
      const imgRect = imgEl.getBoundingClientRect()
      const cartRect = cartEl.getBoundingClientRect()

      const flying = imgEl.cloneNode(true)
      flying.style.position = 'fixed'
      flying.style.left = imgRect.left + 'px'
      flying.style.top = imgRect.top + 'px'
      flying.style.width = imgRect.width + 'px'
      flying.style.height = imgRect.height + 'px'
      flying.style.zIndex = 1000
      flying.style.transition = 'transform 0.6s ease, opacity 0.6s ease'
      document.body.appendChild(flying)

      const deltaX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2)
      const deltaY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2)

      requestAnimationFrame(() => {
        flying.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`
        flying.style.opacity = '0.2'
      })

      setTimeout(() => {
        if (flying && flying.parentNode) flying.parentNode.removeChild(flying)
      }, 700)
    } catch (_) {
      // noop
    }
  }

  useEffect(() => {
    // Принудительная прокрутка к началу страницы для мобильных устройств
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (_) {
        window.scrollTo(0, 0)
      }
    }

    // Немедленная прокрутка
    scrollToTop()

    // Дополнительные прокрутки для мобильных устройств
    setTimeout(() => window.scrollTo(0, 0), 50)
    setTimeout(() => window.scrollTo(0, 0), 100)
    setTimeout(() => window.scrollTo(0, 0), 200)

    // Close profile menu on outside click (mobile)
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.mobile-profile-menu') && !event.target.closest('.mobile-profile-btn')) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [profileMenuOpen])

  // Дополнительный useEffect для принудительной прокрутки при первой загрузке
  useEffect(() => {
    // Множественные попытки прокрутки для мобильных устройств
    const scrollAttempts = [100, 200, 300, 500, 800, 1000]

    scrollAttempts.forEach(delay => {
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, delay)
    })
  }, []) // Выполняется только при первой загрузке

  const getTodayStr = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const fetchTodaySchedule = async () => {
    try {
      setScheduleErr('')
      const { data, error } = await supabase
        .from('seller_schedule')
        .select('seller_id, seller_name')
        .eq('work_date', getTodayStr())
        .order('seller_name')
      if (error) throw error
      const uniq = Array.from(new Map((data || []).map(r => [r.seller_id, r])).values())
      setTodaySellers(uniq.map(r => r.seller_name).filter(Boolean))
    } catch (e) {
      setScheduleErr('Не удалось загрузить график на сегодня')
      setTodaySellers([])
    }
  }

  useEffect(() => {
    fetchTodaySchedule()
    const channel = supabase
      .channel('rt-seller-schedule')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_schedule' }, (payload) => {
        const t = getTodayStr()
        const w = payload.new?.work_date || payload.old?.work_date
        if (w === t) fetchTodaySchedule()
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch (_) { } }
  }, [])

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => window.scrollTo(0, 0), 100)
  }, [])

  useEffect(() => {
    // инициализация счётчика корзины
    try {
      const raw = localStorage.getItem('qaraa_cart')
      const current = raw ? JSON.parse(raw) : []
      const total = Array.isArray(current) ? current.reduce((s, it) => s + (it.qty || 1), 0) : 0
      setCartCount(total)
    } catch (_) {
      setCartCount(0)
    }

    let isMounted = true

    const fetchProducts = async (retryCount = 0) => {
      // Оптимистичная загрузка из кеша
      let hasCache = false
      if (retryCount === 0) {
        try {
          const cached = localStorage.getItem('qaraa_products_cache')
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed)
              setLoading(false) // Сразу показываем контент
              hasCache = true
            }
          }
        } catch (_) { }

        // Если кеша нет, только тогда показываем лоадер
        if (!hasCache) setLoading(true)
      } else if (retryCount !== 999) {
        // Если это не фоновое обновление (999), можем показать лоадер или не менять
      }

      setError('')

      try {
        // products + product_variants (size, quantity, price)
        const { data, error } = await supabase
          .from('products')
          .select('id,name,barcode,image_url, product_variants(size,quantity,price)')
          .order('id')

        if (error) throw error
        if (!isMounted) return

        const normalized = (data || [])
          .map((p) => {
            const variants = Array.isArray(p.product_variants) ? p.product_variants : []
            const visibleVariants = variants.filter(v => (v?.quantity ?? 0) > 0)
            const isVisible = visibleVariants.length > 0
            // сортировка размеров
            const orderMap = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'Стандарт': 9999 }
            const visibleSizes = visibleVariants
              .map(v => ({ size: v.size, qty: v.quantity }))
              .sort((a, b) => {
                const an = Number(a.size)
                const bn = Number(b.size)
                const aIsNum = !isNaN(an)
                const bIsNum = !isNaN(bn)
                if (aIsNum && bIsNum) return an - bn
                if (aIsNum && !bIsNum) return -1
                if (!aIsNum && bIsNum) return 1
                const ao = orderMap[a.size] ?? 5000
                const bo = orderMap[b.size] ?? 5000
                return ao - bo
              })
            const minPrice = visibleVariants.length > 0
              ? Math.min(...visibleVariants.map(v => Number(v.price ?? 0)))
              : 0

            return {
              id: p.id,
              name: p.name || 'Без названия',
              barcode: p.barcode || '',
              price: minPrice,
              image_url: p.image_url || '/src/images/placeholder.png',
              hasSizes: variants.length > 0,
              visibleSizes,
              stock: 0,
              isVisible,
            }
          })
          .filter((p) => p.isVisible)

        // Кешируем для следующего раза (invisible update)
        try { localStorage.setItem('qaraa_products_cache', JSON.stringify(normalized)) } catch (_) { }

        setProducts(normalized)
        setLoading(false)
      } catch (e) {
        console.error('Fetch error:', e)
        // Авто-ретрай 3 раза
        if (retryCount < 3 && isMounted) {
          setTimeout(() => fetchProducts(retryCount + 1), 1000 * (retryCount + 1))
        } else {
          if (isMounted) {
            setError(e.message || 'Ошибка загрузки товаров')
            setLoading(false)
          }
        }
      }
    }

    fetchProducts()

    // Повторная загрузка через 2 секунды на всякий случай (для медленных сетей)
    const timer = setTimeout(() => {
      if (isMounted && products.length === 0) fetchProducts(0)
    }, 2000)

    // Фоновое обновление каждые 5 сек (тихое)
    const interval = setInterval(() => {
      if (isMounted) fetchProducts(999) // специальный флаг для тихого обновления (retryCount=999)
    }, 5000)

    return () => {
      isMounted = false
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 0 2px rgba(48, 209, 88, 0.2); } 50% { box-shadow: 0 0 0 4px rgba(48, 209, 88, 0.4); } }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .home-header-container { 
            padding: 12px 16px !important; 
            min-height: 60px !important;
            backdrop-filter: saturate(180%) blur(20px) !important;
          }
          .home-logo { height: 32px !important; }
          .home-logo-title { font-size: 14px !important; font-weight: 700 !important; }
          .home-logo-subtitle { font-size: 10px !important; }
          
          .dashboard-title { 
            font-size: 32px !important; 
            letter-spacing: -1px !important; 
            margin-bottom: 12px !important;
            line-height: 1.1 !important;
          }
          .dashboard-description { 
            font-size: 15px !important; 
            line-height: 1.4 !important;
            margin-bottom: 20px !important;
          }
          .dashboard-badge { 
            padding: 10px 16px !important; 
            font-size: 13px !important;
            margin-bottom: 32px !important;
            border-radius: 20px !important;
          }
          .dashboard-content { padding: 0 16px !important; }
          .dashboard-section { padding-top: 76px !important; padding-bottom: 40px !important; }
          
          .product-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 12px !important;
            margin-top: 24px !important;
          }
          .product-card { 
            border-radius: 12px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
          }
          .product-card:hover {
            transform: translateY(-2px) scale(1.02) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          }
          .product-image { 
            padding-top: 100% !important;
            border-radius: 12px 12px 0 0 !important;
          }
          .product-content { padding: 12px !important; }
          .product-name { 
            font-size: 14px !important; 
            font-weight: 600 !important;
            line-height: 1.2 !important;
            margin-bottom: 4px !important;
          }
          .product-price { 
            font-size: 16px !important; 
            font-weight: 700 !important;
            margin-top: 8px !important;
          }
          .product-size { 
            padding: 4px 8px !important; 
            font-size: 11px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
          }
          .product-button { 
            padding: 10px 16px !important; 
            font-size: 13px !important; 
            margin-top: 12px !important;
            border-radius: 10px !important;
            font-weight: 700 !important;
          }
          
          /* Mobile Cart Button */
          .mobile-cart-btn {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }
          .mobile-cart-badge {
            top: 2px !important;
            right: 2px !important;
            font-size: 10px !important;
            min-width: 16px !important;
            height: 16px !important;
            padding: 0 4px !important;
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
          
          /* Mobile Modal */
          .mobile-size-modal {
            width: 95% !important;
            max-width: 340px !important;
            padding: 24px !important;
            border-radius: 20px !important;
          }
          .mobile-size-title {
            font-size: 22px !important;
            margin-bottom: 6px !important;
          }
          .mobile-size-subtitle {
            font-size: 15px !important;
            margin-bottom: 20px !important;
          }
          .mobile-size-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
            border-radius: 10px !important;
          }
          .mobile-size-actions {
            gap: 10px !important;
            margin-top: 20px !important;
          }
          .mobile-size-action-btn {
            padding: 14px 18px !important;
            font-size: 15px !important;
            border-radius: 12px !important;
          }
        }
        
        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .dashboard-title { font-size: 28px !important; }
          .product-grid { gap: 10px !important; }
          .product-content { padding: 10px !important; }
          .product-name { font-size: 13px !important; }
          .product-price { font-size: 15px !important; }
          .product-button { padding: 8px 12px !important; font-size: 12px !important; }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          .product-card:hover { transform: none !important; }
          .product-card:active { 
            transform: scale(0.98) !important;
            transition: transform 0.1s ease !important;
          }
          .product-button:hover { transform: none !important; }
          .product-button:active {
            transform: scale(0.95) !important;
            transition: transform 0.1s ease !important;
          }
        }
        
        /* Mobile Footer Styles - точно как в Home.css */
        @media (max-width: 768px) {
          .mobile-footer {
            margin-top: -40px !important;
            padding: 50px 20px 35px !important;
            border-radius: 60px 60px 0 0 !important;
          }
          
          .mobile-footer > div:first-child {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          .mobile-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 35px !important;
            margin-bottom: 35px !important;
            padding: 0 !important;
          }
          
          .mobile-footer-section:first-child .mobile-footer-title:first-child {
            font-size: 20px !important;
            margin-bottom: 10px !important;
          }
          
          .mobile-footer-section:first-child > div:last-child {
            font-size: 14px !important;
          }
          
          .mobile-footer-section > .mobile-footer-title {
            font-size: 11px !important;
            margin-bottom: 15px !important;
          }
          
          .mobile-footer-nav-item,
          .mobile-footer-social {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }
          
          .mobile-footer-bottom {
            margin-top: 50px !important;
            padding-top: 30px !important;
            border-top: 2px solid rgba(0, 0, 0, 0.06) !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            font-size: 13px !important;
          }
          
          .mobile-footer-bottom > div:last-child {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
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
          <div className="home-header-container" style={{
            maxWidth: '1440px', margin: '0 auto', padding: '20px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div className="home-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'opacity 0.3s ease', opacity: 1 }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <img src={logoQaraa} alt="qaraa" className="home-logo" style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div className="home-logo-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: '1' }}>qaraa.kz</div>
                <div className="home-logo-subtitle" style={{ fontSize: '12px', color: '#8E8E93', marginTop: '4px' }}>{t('home.store.subtitle') || 'Безопасная экосистема'}</div>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Desktop/Mobile Smart Language Selector pill in Header */}
              <div
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
                          padding: 0
                        }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                ref={cartBtnRef}
                onClick={() => navigate('/cart')}
                aria-label="Корзина"
                className="mobile-cart-btn"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '20px',
                  color: '#1D1D1F',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
                onTouchStart={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'scale(0.95)' }}
                onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                🛒
                {cartCount > 0 && (
                  <span className="mobile-cart-badge" style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#FF3B30',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '0 6px',
                    height: '18px',
                    minWidth: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1,
                    boxShadow: '0 2px 4px rgba(255, 59, 48, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>{Math.min(cartCount, 99)}</span>
                )}
              </button>
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
                onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
              >
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
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease',
                      color: '#1C1C1E'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
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
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease',
                      color: '#1C1C1E'
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
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease',
                      color: '#1C1C1E'
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
                    onClick={() => { setProfileMenuOpen(false); setShowLogoutConfirm(true) }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#FF3B30',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                  >
                    {t('profile.logout')}
                  </button>
                </div>
              )}

            </div>
          </div>
        </header>

        {/* Content */}
        <section className="dashboard-section" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
          <div className="dashboard-content" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}>
            <div style={{
              animation: 'fadeIn 0.8s ease',
              marginBottom: '48px',
              textAlign: 'left',
              position: 'relative',
              padding: '24px',
              borderRadius: '24px',
              overflow: 'hidden'
            }}>
              {/* Ambient Background */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-20%',
                width: '140%',
                height: '200%',
                background: 'radial-gradient(circle at 30% 20%, rgba(255, 170, 0, 0.08), transparent 40%), radial-gradient(circle at 70% 60%, rgba(255, 59, 48, 0.05), transparent 40%)',
                filter: 'blur(60px)',
                zIndex: 0,
                pointerEvents: 'none'
              }} />

              <h1 className="dashboard-title" style={{
                fontSize: '48px',
                fontWeight: '800',
                letterSpacing: '-1.5px',
                marginBottom: '16px',
                color: '#1D1D1F',
                lineHeight: 1.1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                position: 'relative',
                zIndex: 1
              }}>
                {t('home.catalog_title')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <p className="dashboard-description" style={{
                  fontSize: '17px',
                  color: '#86868B',
                  fontWeight: 400,
                  maxWidth: '500px',
                  letterSpacing: '-0.2px',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {t('home.catalog_subtitle').replace(/\n/g, ' ')}
                </p>
                {/* Glassmorphic Badge */}
                {todaySellers.length > 0 && (
                  <div className="dashboard-badge" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: '100px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    color: '#1D1D1F',
                    fontWeight: '500',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <span style={{ width: 6, height: 6, background: '#30D158', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(48, 209, 88, 0.4)' }} />
                    {t('home.seller_on_duty')} {todaySellers.join(', ')}
                  </div>
                )}
              </div>
            </div>
            {scheduleErr && (
              <div style={{ marginTop: 8, color: '#cf1322' }}>{scheduleErr}</div>
            )}

            {error && (
              <div style={{ padding: '20px 24px', background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', color: '#FF3B30', borderRadius: '16px', marginBottom: '32px', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.2px', boxShadow: '0 2px 8px rgba(255, 59, 48, 0.1)', animation: 'slideUp 0.4s ease' }}>
                ⚠️ {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #F5F5F7', borderTopColor: '#000000', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: '17px', color: '#86868B', fontWeight: 500 }}>{t('home.loading_products')}</div>
              </div>
            ) : (
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {products.map((p, idx) => (
                  <div key={p.id} className="product-card" style={{ borderRadius: '20px', overflow: 'hidden', background: '#FBFBFD', border: '1px solid rgba(0, 0, 0, 0.06)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', animation: `scaleIn 0.5s ease ${idx * 0.05}s backwards`, position: 'relative' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.03)'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#FBFBFD'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)' }}>
                    <div className="product-image" style={{ position: 'relative', paddingTop: '100%', background: '#F5F5F7', overflow: 'hidden' }}>
                      <img id={`product-img-${p.id}`} src={p.image_url} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                    </div>
                    <div className="product-content" style={{ padding: '20px' }}>
                      <div className="product-name" style={{ fontSize: '19px', fontWeight: '600', color: '#1D1D1F', letterSpacing: '-0.5px', marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</div>
                      {!!p.barcode && <div style={{ fontSize: '13px', color: '#86868B', marginBottom: '12px', fontWeight: 400 }}>{t('home.barcode_label')} {p.barcode}</div>}
                      <div className="product-price" style={{ fontSize: '24px', fontWeight: '600', marginTop: '12px', color: '#000000', letterSpacing: '-0.5px' }}>{Number(p.price).toLocaleString('ru-RU')} ₸</div>

                      {p.hasSizes ? (
                        <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {p.visibleSizes.map((s) => (
                            <div key={s.size} className="product-size" style={{ padding: '8px 14px', borderRadius: '8px', background: '#F5F5F7', fontSize: '14px', fontWeight: '500', color: '#1D1D1F', border: '1px solid rgba(0, 0, 0, 0.04)' }}>
                              {s.size}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: '16px', fontSize: '14px', color: '#30D158', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: 6, height: 6, background: '#30D158', borderRadius: '50%', display: 'inline-block' }} />
                          {t('home.in_stock')} {p.stock}
                        </div>
                      )}

                      <button onClick={() => addToCart(p)} className="product-button" style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '16px 24px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '15px',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: '-0.2px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        WebkitTapHighlightColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)'; e.currentTarget.style.background = '#000000' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)' }}
                        onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#000000' }}
                        onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)' }}>
                        <span style={{ fontSize: '18px' }}>+</span>
                        {t('home.cart_pill')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && !error && (
              <div style={{ padding: '120px 20px', textAlign: 'center', animation: 'fadeIn 0.8s ease' }}>
                <div style={{ fontSize: '72px', marginBottom: '24px', opacity: 0.5 }}>📦</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#1D1D1F', marginBottom: '12px', letterSpacing: '-0.5px' }}>{t('home.no_products_title')}</div>
                <div style={{ fontSize: '17px', color: '#86868B', fontWeight: 400, maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>{t('home.no_products_desc')}</div>
              </div>
            )}
          </div>
        </section>

        {/* Spacer before footer */}
        <div style={{ height: '80px' }}></div>

        {sizeModalOpen && sizeProduct && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease'
          }} onClick={() => { setSizeModalOpen(false); setSizeProduct(null); setSelectedSize(null) }}>
            <div onClick={(e) => e.stopPropagation()} className="mobile-size-modal" style={{
              width: '90%', maxWidth: '460px', background: '#FFFFFF', borderRadius: '28px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)', padding: '32px', animation: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div className="mobile-size-title" style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px', color: '#1D1D1F', letterSpacing: '-0.5px' }}>{sizeProduct.name}</div>
              <div className="mobile-size-subtitle" style={{ fontSize: '17px', color: '#86868B', marginBottom: '28px', fontWeight: 400 }}>{t('home.select_size')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {sizeProduct.visibleSizes.map((s) => {
                  const active = selectedSize === s.size
                  return (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)} className="mobile-size-button" style={{
                      padding: '14px 24px', borderRadius: '12px', border: active ? '2px solid #007AFF' : '1px solid rgba(0, 0, 0, 0.1)',
                      background: active ? '#007AFF' : '#F5F5F7', fontWeight: 500, cursor: 'pointer', fontSize: '16px', color: active ? '#FFFFFF' : '#1D1D1F', transition: 'all 0.3s ease', letterSpacing: '-0.2px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                      onMouseEnter={(e) => { if (!active) { e.target.style.background = '#E5E5EA'; e.target.style.borderColor = 'rgba(0, 0, 0, 0.15)' } }}
                      onMouseLeave={(e) => { if (!active) { e.target.style.background = '#F5F5F7'; e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)' } }}
                      onTouchStart={(e) => { if (!active) { e.target.style.background = '#E5E5EA'; e.target.style.transform = 'scale(0.95)' } }}
                      onTouchEnd={(e) => { if (!active) { e.target.style.background = '#F5F5F7'; e.target.style.transform = 'scale(1)' } }}>{s.size}</button>
                  )
                })}
              </div>
              {selectedSize && (() => {
                const sel = sizeProduct.visibleSizes.find(v => v.size === selectedSize)
                const qty = sel?.qty ?? 0
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '16px 20px', background: '#F5F5F7', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    <span style={{ width: 8, height: 8, background: '#30D158', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 2px rgba(48, 209, 88, 0.2)' }} />
                    <span style={{ color: '#1D1D1F', fontWeight: 500, fontSize: '15px' }}>{t('home.in_stock')} {qty} шт.</span>
                  </div>
                )
              })()}
              <div className="mobile-size-actions" style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button onClick={() => { setSizeModalOpen(false); setSizeProduct(null); setSelectedSize(null) }} className="mobile-size-action-btn" style={{
                  flex: 1, padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(0, 0, 0, 0.1)', background: '#F5F5F7', fontWeight: 500, cursor: 'pointer', fontSize: '16px', color: '#1D1D1F', transition: 'all 0.3s ease', letterSpacing: '-0.2px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                  onMouseEnter={(e) => e.target.style.background = '#E5E5EA'}
                  onMouseLeave={(e) => e.target.style.background = '#F5F5F7'}
                  onTouchStart={(e) => { e.target.style.background = '#E5E5EA'; e.target.style.transform = 'scale(0.95)' }}
                  onTouchEnd={(e) => { e.target.style.background = '#F5F5F7'; e.target.style.transform = 'scale(1)' }}>{t('common.cancel')}</button>
                <button onClick={confirmSizeAndAdd} disabled={!selectedSize} className="mobile-size-action-btn" style={{
                  flex: 1, padding: '16px 20px', borderRadius: '14px', border: 'none', background: !selectedSize ? '#E5E5EA' : '#007AFF',
                  color: !selectedSize ? '#86868B' : '#FFFFFF', fontWeight: 500, cursor: !selectedSize ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'all 0.3s ease', letterSpacing: '-0.2px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                  onMouseEnter={(e) => { if (selectedSize) { e.target.style.background = '#0051D5'; e.target.style.transform = 'scale(1.02)' } }}
                  onMouseLeave={(e) => { if (selectedSize) { e.target.style.background = '#007AFF'; e.target.style.transform = 'scale(1)' } }}
                  onTouchStart={(e) => { if (selectedSize) { e.target.style.background = '#0051D5'; e.target.style.transform = 'scale(0.95)' } }}
                  onTouchEnd={(e) => { if (selectedSize) { e.target.style.background = '#007AFF'; e.target.style.transform = 'scale(1)' } }}>{t('home.add')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Footer (как в Home.jsx по стилю, но с нужным контентом) */}
        <footer className="mobile-footer" style={{
          padding: '80px 24px 50px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          color: '#1C1C1E',
          position: 'relative',
          borderRadius: '60px 60px 0 0',
          marginTop: '-40px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="mobile-footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '50px',
              marginBottom: '50px'
            }}>
              <div className="mobile-footer-section">
                <div className="mobile-footer-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#1C1C1E', letterSpacing: '-0.5px' }}>qaraa.kz</div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                  <img
                    src={qaraaCrmLogo}
                    alt="qaraa.crm"
                    style={{ height: '80px', width: 'auto' }}
                  />
                </div>
                <div style={{ fontSize: '15px', color: '#636366', fontWeight: '500', marginTop: '12px' }}>{t('nav.ecosystem_slogan')}</div>
              </div>
              <div className="mobile-footer-section">
                <div className="mobile-footer-title" style={{ fontSize: '13px', fontWeight: '800', color: '#8E8E93', marginBottom: '20px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>{t('nav.navigation')}</div>
                <div onClick={() => navigate('/dashboard')} className="mobile-footer-nav-item" style={{ fontSize: '15px', marginBottom: '12px', cursor: 'pointer', color: '#1C1C1E', fontWeight: '500', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#5856D6'; e.currentTarget.style.paddingLeft = '8px' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1E'; e.currentTarget.style.paddingLeft = '0' }}
                  onTouchStart={(e) => e.currentTarget.style.color = '#5856D6'}
                  onTouchEnd={(e) => e.currentTarget.style.color = '#1C1C1E'}>
                  {t('nav.back_to_main')}
                </div>
                <div onClick={() => navigate('/history')} className="mobile-footer-nav-item" style={{ fontSize: '15px', cursor: 'pointer', color: '#1C1C1E', fontWeight: '500', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#5856D6'; e.currentTarget.style.paddingLeft = '8px' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1E'; e.currentTarget.style.paddingLeft = '0' }}
                  onTouchStart={(e) => e.currentTarget.style.color = '#5856D6'}
                  onTouchEnd={(e) => e.currentTarget.style.color = '#1C1C1E'}>
                  {t('nav.my_orders')}
                </div>
                <div onClick={() => navigate('/cart')} className="mobile-footer-nav-item" style={{ fontSize: '15px', marginTop: '12px', cursor: 'pointer', color: '#1C1C1E', fontWeight: '500', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#5856D6'; e.currentTarget.style.paddingLeft = '8px' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1E'; e.currentTarget.style.paddingLeft = '0' }}
                  onTouchStart={(e) => e.currentTarget.style.color = '#5856D6'}
                  onTouchEnd={(e) => e.currentTarget.style.color = '#1C1C1E'}>
                  {t('nav.cart')}
                </div>
                <div onClick={() => navigate('/track')} className="mobile-footer-nav-item" style={{ fontSize: '15px', marginTop: '12px', cursor: 'pointer', color: '#1C1C1E', fontWeight: '500', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#5856D6'; e.currentTarget.style.paddingLeft = '8px' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1E'; e.currentTarget.style.paddingLeft = '0' }}
                  onTouchStart={(e) => e.currentTarget.style.color = '#5856D6'}
                  onTouchEnd={(e) => e.currentTarget.style.color = '#1C1C1E'}>
                  {t('nav.track_order')}
                </div>
              </div>
              <div className="mobile-footer-section">
                <div className="mobile-footer-title" style={{ fontSize: '13px', fontWeight: '800', color: '#8E8E93', marginBottom: '20px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>{t('nav.social_networks')}</div>
                {[
                  { name: 'Instagram', url: 'https://www.instagram.com/qaraa.kz?igsh=cWw3cmlsNmJ0ZHRi' },
                  { name: 'TikTok', url: 'https://www.tiktok.com/@qaraa.kz?_r=1&_t=ZM-91EaJ8tj6Do' },
                  { name: 'Telegram', url: 'https://t.me/qaraa_kz' },
                  { name: 'WhatsApp', url: 'https://wa.me/77778307588' }
                ].map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="mobile-footer-social" style={{ display: 'block', fontSize: '15px', color: '#1C1C1E', fontWeight: '500', textDecoration: 'none', marginBottom: '12px', transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#5856D6'; e.currentTarget.style.paddingLeft = '8px' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#1C1C1E'; e.currentTarget.style.paddingLeft = '0' }}
                    onTouchStart={(e) => e.currentTarget.style.color = '#5856D6'}
                    onTouchEnd={(e) => e.currentTarget.style.color = '#1C1C1E'}>
                    {s.name}
                  </a>
                ))}
              </div>
              <div className="mobile-footer-section">
                <div className="mobile-footer-title" style={{ fontSize: '13px', fontWeight: '800', color: '#8E8E93', marginBottom: '20px', letterSpacing: '1.2px', textTransform: 'uppercase' }}>{t('nav.information')}</div>
                <div style={{ fontSize: '15px', marginBottom: '12px', color: '#1C1C1E', fontWeight: '500' }}>{t('nav.phone_number')}</div>
                <div style={{ fontSize: '15px', color: '#636366', fontWeight: '500' }}>{t('nav.address_city')}</div>
                <div style={{ fontSize: '15px', marginTop: '12px', color: '#636366', fontWeight: '500' }}>{t('nav.address_street')}</div>
              </div>
            </div>
            <div className="mobile-footer-bottom" style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '2px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '15px',
              color: '#8E8E93',
              fontWeight: '600'
            }}>
              <div>© 2026 qaraa.kz | {t('security.success') === 'Құпия сөз сәтті өзгертілді' ? 'Барлық құқықтар қорғалған.' : t('security.success') === 'Пароль успешно изменен' ? 'Все права защищены.' : 'All rights reserved.'}</div>
            </div>
          </div>
        </footer>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '320px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1D1D1F',
              marginBottom: '12px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {t('profile.logout_confirm_title')}
            </div>

            <div style={{
              fontSize: '16px',
              color: '#86868B',
              lineHeight: 1.4,
              marginBottom: '24px'
            }}>
              {t('profile.logout_confirm_msg')}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
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
                {t('common.cancel')}
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
      )}

      {/* Sticky Cart Footer - Centered & Compact */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '34px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          width: 'auto',
          animation: 'slideUp 0.3s ease'
        }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'rgba(28, 28, 30, 0.8)',
              backdropFilter: 'blur(20px)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#000000' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(28, 28, 30, 0.8)' }}
            onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#000000' }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(28, 28, 30, 0.8)' }}
          >
            <div style={{
              background: '#FFFFFF',
              color: '#000000',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {cartCount}
            </div>
            <span>{t('home.cart_pill')}</span>
            <span style={{ fontSize: '18px' }}>🛒</span>
          </button>
        </div>
      )}
    </>
  )
}
