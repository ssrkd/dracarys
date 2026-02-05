import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import kaspiLogo from '../images/kaspi.svg'
import halykLogo from '../images/halyk.svg'
import cashLogo from '../images/cash.png'
import freedomIcon from '../images/freedom.png'
// Импорты логотипов будут через публичную папку

export default function Cart({ customer, onLogout }) {
  const { t, lang, setLang } = useLang()
  usePageTitle(t('nav.cart'))
  const navigate = useNavigate()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: card, 2: delivery
  const [method, setMethod] = useState('pickup') // только pickup
  const [errors, setErrors] = useState({})
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, targetIndex: null })
  const [isPlacing, setIsPlacing] = useState(false)
  const [toasts, setToasts] = useState([])

  // KZ delivery form
  const [kzForm, setKzForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    postal_code: ''
  })

  // City delivery form
  const [cityForm, setCityForm] = useState({
    address: '',
    phone: '',
    entrance: '',
    apartment: '',
    floor: '',
    intercom: '',
    comment: ''
  })

  // Pickup form
  const [pickupSelf, setPickupSelf] = useState(true)
  const [pickupForm, setPickupForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    comment: ''
  })

  // Close profile menu and lang selector on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.mobile-profile-btn') && !event.target.closest('.mobile-profile-menu')) {
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

  // Helpers to reset checkout state/forms
  const resetCheckoutState = () => {
    setCheckoutStep(1)
    setMethod('pickup')
    setErrors({})
    setKzForm({
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      city: '',
      street: '',
      house: '',
      apartment: '',
      postal_code: ''
    })
    setCityForm({
      address: '',
      phone: '',
      entrance: '',
      apartment: '',
      floor: '',
      intercom: '',
      comment: ''
    })
    setPickupSelf(true)
    setPickupForm({
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      comment: ''
    })
  }

  const openCheckout = () => {
    resetCheckoutState()
    setShowCheckout(true)
  }

  const closeCheckout = () => {
    setShowCheckout(false)
    resetCheckoutState()
  }

  useEffect(() => {
    const raw = localStorage.getItem('qaraa_cart')
    try {
      const parsed = raw ? JSON.parse(raw) : []
      const normalized = (Array.isArray(parsed) ? parsed : []).map(it => ({
        ...it,
        qty: Math.max(1, Number(it.qty || 1)),
        maxQty: Math.max(1, Number(it.maxQty || 99))
      }))
      setItems(normalized)
      setHydrated(true)
    } catch (e) {
      setItems([])
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' }) // Force instant scroll
    setTimeout(() => window.scrollTo(0, 0), 50)  // Double check
    setHydrated(true)
  }, [])

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.mobile-profile-btn') && !event.target.closest('.mobile-profile-menu')) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileMenuOpen])

  // Если в корзине есть позиции без штрих‑кода — дотянуть его из БД для отображения
  useEffect(() => {
    const enrichBarcodes = async () => {
      if (!hydrated) return
      const need = items.some(it => !it?.barcode && it?.id != null)
      if (!need) return
      const normSize = (s) => (s == null ? null : String(s).trim())
      const next = [...items]
      let changed = false
      for (let i = 0; i < next.length; i++) {
        const it = next[i]
        if (it?.barcode || it?.id == null) continue
        const pid = Number(it.id)
        const size = normSize(it.size)
        let bc = ''
        try {
          if (size) {
            const { data: v } = await supabase
              .from('product_variants')
              .select('barcode')
              .eq('product_id', pid)
              .ilike('size', `%${size}%`)
              .maybeSingle()
            if (v?.barcode) bc = String(v.barcode)
          }
          if (!bc) {
            const { data: v1 } = await supabase
              .from('product_variants')
              .select('barcode')
              .eq('product_id', pid)
              .limit(1)
            if (Array.isArray(v1) && v1[0]?.barcode) bc = String(v1[0].barcode)
          }
          if (!bc) {
            const { data: p } = await supabase
              .from('products')
              .select('barcode')
              .eq('id', pid)
              .maybeSingle()
            if (p?.barcode) bc = String(p.barcode)
          }
        } catch (_) { }
        if (bc) {
          next[i] = { ...it, barcode: bc }
          changed = true
        }
      }
      if (changed) {
        setItems(next)
        try { localStorage.setItem('qaraa_cart', JSON.stringify(next)) } catch (_) { }
      }
    }
    enrichBarcodes()
  }, [hydrated, items])

  useEffect(() => {
    try {
      const sum = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 1)), 0)
      setTotal(sum)
      if (hydrated) {
        localStorage.setItem('qaraa_cart', JSON.stringify(items))
      }
    } catch (_) { }
  }, [items, hydrated])

  useEffect(() => {
    // Prefill pickup form from customer
    if (pickupSelf && customer) {
      setPickupForm(prev => ({
        ...prev,
        first_name: customer.first_name ? sanitizeLetters(customer.first_name) : prev.first_name,
        last_name: customer.last_name ? sanitizeLetters(customer.last_name) : prev.last_name,
        phone: (customer.phone && sanitizeDigitsLen(String(customer.phone), 10)) || prev.phone
      }))
    }
  }, [pickupSelf, customer])

  const inc = (index) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== index) return it
      const next = Math.min((it.qty || 1) + 1, it.maxQty || 99)
      return { ...it, qty: next }
    }))
  }

  const dec = (index) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== index) return it
      const next = Math.max((it.qty || 1) - 1, 1)
      return { ...it, qty: next }
    }))
  }

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    localStorage.removeItem('qaraa_cart')
    setItems([])
  }

  const handleDeleteClick = (index) => {
    setConfirmModal({ show: true, type: 'item', targetIndex: index })
  }

  const handleClearClick = () => {
    setConfirmModal({ show: true, type: 'all', targetIndex: null })
  }

  const confirmAction = () => {
    if (confirmModal.type === 'item') {
      removeItem(confirmModal.targetIndex)
      showToast('success', t('cart.toast_deleted'))
    } else if (confirmModal.type === 'all') {
      clearCart()
      showToast('success', t('cart.toast_cleared'))
    }
    setConfirmModal({ show: false, type: null, targetIndex: null })
  }

  const cancelConfirm = () => {
    setConfirmModal({ show: false, type: null, targetIndex: null })
  }

  const showToast = (type, text) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id))
    }, 2600)
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const onlyLetters = (v) => /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v || '')
  const onlyDigits = (v) => /^\d+$/.test(v || '')
  const phoneIsValid = (v) => /^7\d{9}$/.test((v || '').replace(/\D/g, ''))
  const onlyLettersCity = (v) => /^[A-Za-zА-Яа-яЁё\s-]+$/.test(v || '')
  const houseDigits = (v) => /^\d+$/.test(v || '')
  const apartmentDigits = (v) => v === '' || /^\d+$/.test(v)
  const postal6 = (v) => /^\d{6}$/.test(v || '')

  // Sanitizers and formatters
  const capEachWord = (s = '') => s
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ')

  const sanitizeLetters = (v = '') => capEachWord(v.replace(/[^A-Za-zА-Яа-яЁё\s-]/g, ''))
  const sanitizeCity = (v = '') => capEachWord(v.replace(/[^A-Za-zА-Яа-яЁё\s-]/g, ''))
  const sanitizeStreet = (v = '') => v.replace(/[^A-Za-zА-Яа-яЁё0-9\s\-\/.]/g, '')
  const sanitizeDigitsLen = (v = '', max = 99) => v.replace(/\D/g, '').slice(0, max)
  const sanitizeIntercom = (v = '') => v.replace(/[^0-9#*]/g, '').slice(0, 4)

  // Phone stores 10 digits, input shows as "+7 " + digits
  const formatPhoneKaz = (ten = '') => {
    const a = ten.slice(0, 3)
    const b = ten.slice(3, 6)
    const c = ten.slice(6, 8)
    const d = ten.slice(8, 10)
    let out = '+7 '
    if (a) out += a
    if (b) out += `-(${b})`
    if (c) out += `-${c}`
    if (d) out += `-${d}`
    return out
  }
  const parsePhoneInput = (v = '') => {
    const digits = v.replace(/\D/g, '')
    const withoutCountry = digits.startsWith('7') ? digits.slice(1) : digits
    // drop any leading non-7 until user inputs 7 as first payload digit
    let ten = withoutCountry.replace(/^[^7]+/, '')
    return ten.slice(0, 10)
  }

  const intercomValid = (v) => v === '' || /^[0-9#*]+$/.test(v)

  const validateKZ = () => {
    const e = {}
    if (!onlyLetters(kzForm.first_name)) e.first_name = t('cart.error_only_letters')
    if (!onlyLetters(kzForm.last_name)) e.last_name = t('cart.error_only_letters')
    if (kzForm.middle_name && !onlyLetters(kzForm.middle_name)) e.middle_name = t('cart.error_only_letters')
    if (!phoneIsValid(kzForm.phone)) e.phone = t('cart.error_phone_format')
    if (!onlyLettersCity(kzForm.city)) e.city = t('cart.error_city_letters')
    if (!kzForm.street) e.street = t('cart.error_street_required')
    if (!houseDigits(kzForm.house)) e.house = t('cart.error_only_digits')
    if (!apartmentDigits(kzForm.apartment)) e.apartment = t('cart.error_only_digits')
    if (!postal6(kzForm.postal_code)) e.postal_code = t('cart.error_zip_format')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateCity = () => {
    const e = {}
    if (!cityForm.address) e.address = t('cart.error_required')
    if (!phoneIsValid(cityForm.phone)) e.phone = t('cart.error_phone_format')
    if (cityForm.entrance && !onlyDigits(cityForm.entrance)) e.entrance = t('cart.error_only_digits')
    if (cityForm.apartment && !onlyDigits(cityForm.apartment)) e.apartment = t('cart.error_only_digits')
    if (cityForm.floor && !onlyDigits(cityForm.floor)) e.floor = t('cart.error_only_digits')
    if (!intercomValid(cityForm.intercom)) e.intercom = t('cart.error_intercom_format')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePickup = () => {
    const e = {}
    if (pickupSelf) {
      // уже автозаполнено
    } else {
      if (!onlyLetters(pickupForm.first_name)) e.first_name = t('cart.error_only_letters')
      if (!onlyLetters(pickupForm.last_name)) e.last_name = t('cart.error_only_letters')
      if (pickupForm.middle_name && !onlyLetters(pickupForm.middle_name)) e.middle_name = t('cart.error_only_letters')
      if (!phoneIsValid(pickupForm.phone)) e.phone = t('cart.error_phone_format')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const shippingCost = 0
  const toPay = total + shippingCost

  const proceedToDelivery = () => {
    setCheckoutStep(2)
    // Автоскролл к началу модального окна
    setTimeout(() => {
      const modal = document.querySelector('.checkout-modal')
      if (modal) {
        modal.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  const placeOrder = async () => {
    if (isPlacing) return
    let ok = false
    if (method === 'kz') ok = validateKZ()
    if (method === 'city') ok = validateCity()
    if (method === 'pickup') ok = validatePickup()

    if (!ok) {
      showToast('error', t('cart.error_fill_fields') || 'Пожалуйста, заполните все обязательные поля')
      return
    }

    setIsPlacing(true)
    try {
      const itemsTotal = total - (method === 'kz' ? 2000 : 0)
      const bonusToAdd = Math.round(itemsTotal * 0.05)

      // Разрешим id клиента: сначала берем из пропсов, если невалидно — ищем по телефону
      let customerIdNum = null
      if (customer?.id != null && !Number.isNaN(Number(customer.id))) {
        customerIdNum = Number(customer.id)
      } else {
        const raw = String(customer?.phone || '').trim()
        const digits = raw.replace(/\D/g, '')
        const candidates = [raw, digits, raw.startsWith('+') ? raw : ('+' + digits)]
        for (const ph of candidates) {
          if (!ph) continue
          const { data, error } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', ph)
            .maybeSingle()
          if (error) continue
          if (data?.id != null && !Number.isNaN(Number(data.id))) { customerIdNum = Number(data.id); break }
        }
      }
      if (customerIdNum == null) throw new Error('Не удалось определить клиента (id)')

      // Готовим даты
      const now = new Date()
      const expires = new Date(now)
      expires.setMonth(expires.getMonth() + 12)

      // Обогатить каждый item штрих‑кодом при его отсутствии
      const normSize = (s) => (s == null ? null : String(s).trim())
      const enriched = []
      for (const it of items) {
        let bc = (it.barcode && String(it.barcode).trim()) || ''
        const pid = it.id != null ? Number(it.id) : null
        const size = normSize(it.size)
        if (!bc && pid) {
          try {
            if (size) {
              const { data: v } = await supabase
                .from('product_variants')
                .select('barcode')
                .eq('product_id', pid)
                .ilike('size', `%${size}%`)
                .maybeSingle()
              if (v?.barcode) bc = String(v.barcode)
            }
            if (!bc) {
              const { data: v1 } = await supabase
                .from('product_variants')
                .select('barcode')
                .eq('product_id', pid)
                .limit(1)
              if (Array.isArray(v1) && v1[0]?.barcode) bc = String(v1[0].barcode)
            }
            if (!bc) {
              const { data: p } = await supabase
                .from('products')
                .select('barcode')
                .eq('id', pid)
                .maybeSingle()
              if (p?.barcode) bc = String(p.barcode)
            }
          } catch (_) { }
        }
        enriched.push({ ...it, barcode: bc || it.barcode || null })
      }

      // Сформировать JSON позиций заказа (одна таблица orders) из обогащённых позиций
      const orderItems = enriched.map(it => ({
        product_id: it.id != null ? Number(it.id) : null,
        barcode: it.barcode || null,
        name: it.name,
        size: it.size || null,
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        image_url: it.image_url || null
      }))

      let contact = {}
      if (method === 'kz') {
        contact = { first_name: kzForm.first_name, last_name: kzForm.last_name, phone: '+7 ' + kzForm.phone }
      } else if (method === 'city') {
        contact = { phone: '+7 ' + cityForm.phone }
      } else {
        // Pickup
        if (pickupSelf) {
          contact = {
            first_name: customer?.first_name || '',
            last_name: customer?.last_name || '',
            phone: customer?.phone || ''
          }
        } else {
          contact = { first_name: pickupForm.first_name, last_name: pickupForm.last_name, phone: pickupForm.phone ? '+7 ' + pickupForm.phone : '' }
        }
      }

      const address_json = method === 'kz'
        ? { method, city: kzForm.city, street: kzForm.street, house: kzForm.house, apartment: kzForm.apartment, postal_code: kzForm.postal_code }
        : method === 'city'
          ? { method, address: cityForm.address, entrance: cityForm.entrance, apartment: cityForm.apartment, floor: cityForm.floor, intercom: cityForm.intercom, comment: cityForm.comment }
          : { method, pickup_self: pickupSelf, comment: pickupForm.comment }

      // Вставка заказа
      const { data: orderIns, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: customerIdNum,
          items: orderItems,
          total_amount: toPay,
          delivery_method: method,
          status: 'new',
          contact,
          address_json,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          created_at: now.toISOString()
        })
        .select('id')
        .single()
      if (orderErr) throw new Error('Orders insert: ' + orderErr.message)

      // Оповещение в Telegram группу о новом онлайн‑заказе (fire-and-forget)
      try {
        const notifyPayload = {
          action: 'notify_new_online_order',
          order_id: orderIns?.id,
          sum: Number(toPay || 0),
          items_count: Array.isArray(orderItems) ? orderItems.length : items.length,
          customer_name: pickupSelf
            ? [pickupForm.first_name, pickupForm.last_name].filter(Boolean).join(' ').trim()
            : [pickupForm.first_name, pickupForm.last_name].filter(Boolean).join(' ').trim(),
          customer_phone: pickupSelf ? pickupForm.phone : pickupForm.phone,
          delivery_method: method,
          created_at: now.toISOString()
        }
        // Отправляем на серверлес вебхук. Если задан VITE_WEBHOOK_URL — используем его, иначе дефолт на прод URL.
        const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WEBHOOK_URL) || ''
        // По умолчанию — домен задеплоенного бота
        const webhookUrl = envUrl || 'https://qaraa-telegram-bot.vercel.app/api/webhook';
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifyPayload)
        }).catch(() => { })
      } catch (_) { }

      // Первичное событие трекинга: заказ создан (Онлайн)
      try {
        if (orderIns?.id != null) {
          await supabase
            .from('order_status_events')
            .insert({
              order_id: orderIns.id,
              status: 'created',
              seller_id: null,
              seller_name: 'Онлайн',
              created_at: now.toISOString()
            })
        }
      } catch (_) { }

      // Кэшбэк начислится при выдаче заказа продавцом

      // Очистим корзину и покажем красивое уведомление
      clearCart()
      setShowCheckout(false)
      resetCheckoutState()
      setShowSuccessModal(true)
    } catch (e) {
      alert('Ошибка при оформлении: ' + (e?.message || 'неизвестная ошибка'))
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <>
      {/* Toast Notifications - AdminPanel Style */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10001,
        width: 'auto',
        maxWidth: '90%'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 20px',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            background: t.type === 'success'
              ? 'linear-gradient(180deg, #34C759 0%, #2BB24F 100%)'
              : 'linear-gradient(180deg, #FF3B30 0%, #E03128 100%)',
            animation: 'slideInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {t.type === 'success' ? '✓ ' : '⚠︎ '} {t.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2); } 50% { box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.4); } }
        @keyframes modalSlideIn { 
          from { 
            opacity: 0; 
            transform: scale(0.8) translateY(60px); 
            filter: blur(10px);
          } 
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
            filter: blur(0px);
          } 
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes stepProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .cart-header-container { 
            padding: 12px 16px !important; 
            min-height: 60px !important;
          }
          .cart-logo { height: 32px !important; }
          .cart-logo-title { font-size: 14px !important; font-weight: 700 !important; }
          .cart-logo-subtitle { font-size: 10px !important; }
          
          .cart-main { 
            padding: 80px 16px 40px !important; 
          }
          .cart-title { 
            font-size: 32px !important; 
            margin-bottom: 8px !important;
          }
          .cart-description { 
            font-size: 15px !important; 
            margin-bottom: 20px !important;
          }
          
          .cart-grid { 
            grid-template-columns: 1fr !important; 
            gap: 12px !important;
          }
          .cart-item { 
            padding: 12px !important;
            border-radius: 12px !important;
          }
          .cart-item-image { 
            width: 60px !important; 
            height: 60px !important;
          }
          .cart-item-name { 
            font-size: 15px !important;
          }
          .cart-item-price { 
            font-size: 16px !important;
          }
          
          .cart-controls button { 
            width: 28px !important; 
            height: 28px !important;
            font-size: 14px !important;
          }
          .cart-quantity { 
            min-width: 24px !important;
            font-size: 14px !important;
          }
          
          .cart-total { 
            font-size: 18px !important;
          }
          .cart-buttons { 
            flex-direction: column !important;
            gap: 12px !important;
          }
          .cart-button { 
            width: 100% !important;
            padding: 14px 20px !important;
            font-size: 16px !important;
          }
          
          .checkout-modal { 
            width: 90% !important;
            max-width: 500px !important;
            max-height: 85vh !important;
            padding: 20px !important;
            border-radius: 20px !important;
            overflow-y: auto !important;
          }
          .checkout-title { 
            font-size: 20px !important;
          }
          .checkout-form { 
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          .cart-item:hover { transform: none !important; }
          .cart-item:active { 
            transform: scale(0.98) !important;
            transition: transform 0.1s ease !important;
          }
          .cart-button:hover { transform: none !important; }
          .cart-button:active {
            transform: scale(0.95) !important;
            transition: transform 0.1s ease !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease'
        }}>
          <div className="cart-header-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <img src={logoQaraa} alt="qaraa" className="cart-logo" style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div className="cart-logo-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: 1 }}>qaraa.kz</div>
                <div className="cart-logo-subtitle" style={{ fontSize: '12px', color: '#8E8E93', marginTop: 4 }}>{t('nav.ecosystem_slogan') || 'Безопасная экосистема'}</div>
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

        <main className="cart-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 40px' }}>
          <div style={{ animation: 'fadeIn 0.8s ease', marginBottom: '32px' }}>
            <h1 className="cart-title" style={{
              fontSize: '48px',
              fontWeight: '800',
              letterSpacing: '-2px',
              marginBottom: '12px',
              color: '#000000',
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
            }}>{t('cart.title')}</h1>
            <p className="cart-description" style={{
              fontSize: '19px',
              color: '#86868B',
              marginBottom: 0,
              fontWeight: 400,
              lineHeight: 1.6,
              letterSpacing: '-0.2px'
            }}>{t('cart.description')}</p>
          </div>

          {items.length === 0 ? (
            <div style={{
              padding: '80px 20px',
              background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
              borderRadius: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.8s ease',
              border: '1px solid rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.6 }}>🛒</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1D1D1F', marginBottom: '12px', letterSpacing: '-0.5px' }}>{t('cart.empty_title')}</div>
              <div style={{ fontSize: '17px', color: '#86868B', fontWeight: 400, maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.5 }}>
                {t('cart.empty_desc')}
              </div>
              <button
                onClick={() => navigate('/storedashboard')}
                className="cart-button"
                style={{
                  background: '#007AFF',
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: '100px',
                  border: 'none',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.25)',
                  transition: 'all 0.3s ease',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.35)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.25)' }}
                onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.35)' }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.25)' }}
              >
                {t('home.catalog_title')}
              </button>
            </div>
          ) : (
            <div style={{ animation: 'slideUp 0.6s ease' }}>
              <div className="cart-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                {items.map((it, idx) => {
                  const canInc = (it.qty || 1) < (it.maxQty || 99)
                  return (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: '24px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `scaleIn 0.5s ease ${idx * 0.05}s backwards`,
                      cursor: 'pointer'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.07)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                      }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <img src={it.image_url || cashLogo} alt={it.name} style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          background: '#F5F5F7'
                        }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1D1D1F',
                            letterSpacing: '-0.3px',
                            lineHeight: 1.2
                          }}>{it.name}</div>

                          {it.size && <div style={{
                            fontSize: '14px',
                            color: '#86868B',
                            fontWeight: '500',
                            padding: '4px 8px',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '8px',
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>{t('cart.size')}: {it.size}</div>}

                          <div style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#000000',
                            letterSpacing: '-0.5px',
                            marginTop: '4px'
                          }}>{Number(it.price).toLocaleString('ru-RU')} ₸</div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button onClick={() => dec(idx)} style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#F2F2F7',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '18px',
                            color: '#1D1D1F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E5EA'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#F2F2F7'}>−</button>

                          <div style={{
                            minWidth: '28px',
                            textAlign: 'center',
                            fontWeight: '700',
                            fontSize: '17px',
                            color: '#1D1D1F'
                          }}>{it.qty || 1}</div>

                          <button onClick={() => canInc && inc(idx)} disabled={!canInc} style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            border: 'none',
                            background: canInc ? '#F2F2F7' : '#F2F2F7',
                            cursor: canInc ? 'pointer' : 'not-allowed',
                            fontWeight: '700',
                            fontSize: '18px',
                            color: canInc ? '#1D1D1F' : '#C7C7CC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => { if (canInc) e.currentTarget.style.background = '#E5E5EA' }}
                            onMouseLeave={(e) => { if (canInc) e.currentTarget.style.background = '#F2F2F7' }}>+</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#86868B',
                            fontWeight: '600'
                          }}>
                            {t('cart.in_stock')}: {it.maxQty || 99}
                          </div>

                          <button onClick={() => handleDeleteClick(idx)} style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(255, 59, 48, 0.08)',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '13px',
                            color: '#FF3B30',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 59, 48, 0.08)' }}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                animation: 'slideUp 0.6s ease 0.2s backwards'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div className="cart-total" style={{
                    fontWeight: '700',
                    fontSize: '28px',
                    color: '#000000',
                    letterSpacing: '-1px'
                  }}>{t('cart.total')}: {Number(total).toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-US' : 'ru-RU')} ₸</div>
                </div>
                <div className="cart-buttons" style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-end'
                }}>
                  <button onClick={handleClearClick} style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 69, 58, 0.05)',
                    color: '#FF3B30',
                    border: '1px solid rgba(255, 69, 58, 0.12)',
                    borderRadius: '14px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(255, 59, 48, 0.05)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 69, 58, 0.12)';
                      e.currentTarget.style.border = '1px solid rgba(255, 69, 58, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 59, 48, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 69, 58, 0.05)';
                      e.currentTarget.style.border = '1px solid rgba(255, 69, 58, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 59, 48, 0.05)';
                    }}>
                    {t('cart.clear')}
                  </button>
                  <button onClick={openCheckout} className="cart-button" style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '-0.2px',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25)',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.35)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.25)' }}
                    onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.4)' }}
                    onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.25)' }}>
                    {t('cart.to_pay')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {showCheckout && (
          <div onClick={closeCheckout} style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div onClick={(e) => e.stopPropagation()} className="checkout-modal" style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '32px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
              animation: 'modalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Прогресс-бар */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '28px 28px 0 0',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: checkoutStep === 1 ? '50%' : '100%',
                  background: 'linear-gradient(90deg, #007AFF 0%, #30D158 100%)',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                position: 'relative'
              }}>
                <div>
                  <div className="checkout-title" style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1D1D1F',
                    letterSpacing: '-0.5px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                    marginBottom: '4px'
                  }}>{t('cart.checkout_title')}</div>
                  <div style={{
                    fontSize: '15px',
                    color: '#86868B',
                    fontWeight: '500'
                  }}>{t('cart.step_1_of_2').replace('1', checkoutStep)}</div>
                </div>
                <button onClick={closeCheckout} style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '20px',
                  color: '#86868B',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E5EA 0%, #D1D1D6 100%)';
                    e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                    e.currentTarget.style.color = '#FF3B30';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)';
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    e.currentTarget.style.color = '#86868B';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E5E5EA 0%, #D1D1D6 100%)';
                    e.currentTarget.style.transform = 'scale(0.9)';
                    e.currentTarget.style.color = '#FF3B30'
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.color = '#86868B'
                  }}>×</button>
              </div>
              {checkoutStep === 1 && (
                <div style={{ animation: 'slideUp 0.5s ease' }}>
                  <div style={{
                    marginBottom: '24px',
                    padding: '12px 16px',
                    background: 'rgba(0, 122, 255, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 122, 255, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#007AFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        background: '#007AFF',
                        borderRadius: '50%',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>1</span>
                      {t('cart.step_1_title')}
                    </div>
                  </div>

                  <div style={{
                    padding: '40px 32px',
                    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 50%, #F5F5F7 100%)',
                    borderRadius: '24px',
                    marginBottom: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 8px 32px rgba(0, 0, 0, 0.08)'
                  }}>
                    {/* Блестящий эффект */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                      animation: 'shimmer 2s infinite',
                      backgroundSize: '200% 100%'
                    }} />

                    <div style={{
                      fontSize: '64px',
                      marginBottom: '20px',
                      animation: 'bounce 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                    }}>💳</div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1D1D1F',
                      marginBottom: '12px',
                      letterSpacing: '-0.5px',
                      background: 'linear-gradient(135deg, #1D1D1F 0%, #007AFF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>{t('cart.bind_card_title')}</div>
                    <div style={{
                      fontSize: '17px',
                      color: '#86868B',
                      fontWeight: '500',
                      lineHeight: 1.6,
                      maxWidth: '320px',
                      margin: '0 auto'
                    }}>
                      {t('cart.integration_msg')}<br />
                      <span style={{ color: '#007AFF', fontWeight: '600' }}>{t('cart.delivery_msg')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      onPointerDown={closeCheckout}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '14px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        background: '#F5F5F7',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#1D1D1F',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E5EA'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.transform = 'translateY(0)' }}
                      onTouchStart={(e) => { e.currentTarget.style.background = '#E5E5EA'; e.currentTarget.style.transform = 'scale(0.96)' }}
                      onTouchEnd={(e) => { e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.transform = 'scale(1)' }}>
                      {t('cart.cancel')}
                    </button>
                    <button
                      onPointerDown={proceedToDelivery}
                      style={{
                        padding: '16px 32px',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '17px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        letterSpacing: '-0.3px',
                        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        WebkitTapHighlightColor: 'transparent',
                        position: 'relative',
                        overflow: 'hidden',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.transform = 'scale(0.96)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.2)'
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}>
                      <span style={{ position: 'relative', zIndex: 1 }}>{t('cart.next')} →</span>
                    </button>
                  </div>
                </div>
              )}
              {checkoutStep === 2 && (
                <div style={{ animation: 'slideUp 0.5s ease' }}>
                  <div style={{
                    marginBottom: '24px',
                    padding: '12px 16px',
                    background: 'rgba(48, 209, 88, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(48, 209, 88, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#30D158',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        background: '#30D158',
                        borderRadius: '50%',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>2</span>
                      {t('cart.step_2_title')}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1D1D1F',
                      marginBottom: '16px',
                      letterSpacing: '-0.3px'
                    }}>{t('cart.choose_delivery')}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Недоступные опции */}
                      <div style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        background: '#F5F5F7',
                        opacity: 0.6,
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#86868B',
                              marginBottom: '4px'
                            }}>🚚 {t('cart.delivery_kz')}</div>
                            <div style={{
                              fontSize: '14px',
                              color: '#86868B'
                            }}>{t('cart.temp_unavailable')}</div>
                          </div>
                          <div style={{
                            padding: '6px 12px',
                            background: 'rgba(255, 149, 0, 0.1)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#FF9500'
                          }}>{t('cart.soon_badge')}</div>
                        </div>
                      </div>

                      <div style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        background: '#F5F5F7',
                        opacity: 0.6,
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#86868B',
                              marginBottom: '4px'
                            }}>🏢 {t('cart.delivery_city')}</div>
                            <div style={{
                              fontSize: '14px',
                              color: '#86868B'
                            }}>{t('cart.temp_unavailable')}</div>
                          </div>
                          <div style={{
                            padding: '6px 12px',
                            background: 'rgba(255, 149, 0, 0.1)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#FF9500'
                          }}>{t('cart.soon_badge')}</div>
                        </div>
                      </div>

                      {/* Активная опция */}
                      <button onClick={() => { setMethod('pickup'); setErrors({}) }} style={{
                        padding: '20px 24px',
                        borderRadius: '16px',
                        border: '2px solid #007AFF',
                        background: 'rgba(0, 122, 255, 0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 122, 255, 0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        onTouchStart={(e) => { e.currentTarget.style.background = 'rgba(0, 122, 255, 0.15)'; e.currentTarget.style.transform = 'scale(0.98)' }}
                        onTouchEnd={(e) => { e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)'; e.currentTarget.style.transform = 'scale(1)' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#007AFF',
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              🏠 {t('cart.pickup')}
                              <span style={{
                                padding: '4px 8px',
                                background: '#30D158',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#FFFFFF'
                              }}>{t('cart.free')}</span>
                            </div>
                            <div style={{
                              fontSize: '15px',
                              color: '#007AFF',
                              fontWeight: '500'
                            }}>{t('cart.pickup_address')}</div>
                          </div>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            background: '#007AFF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '16px'
                          }}>✓</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {method === 'kz' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      <Field label={t('cart.form_name')} required value={kzForm.first_name} onChange={(v) => setKzForm({ ...kzForm, first_name: sanitizeLetters(v) })} error={errors.first_name} />
                      <Field label={t('cart.form_surname')} required value={kzForm.last_name} onChange={(v) => setKzForm({ ...kzForm, last_name: sanitizeLetters(v) })} error={errors.last_name} />
                      <Field label={t('cart.form_middlename')} value={kzForm.middle_name} onChange={(v) => setKzForm({ ...kzForm, middle_name: sanitizeLetters(v) })} error={errors.middle_name} />
                      <Field label={t('cart.form_phone')} required value={formatPhoneKaz(kzForm.phone)} onChange={(v) => setKzForm({ ...kzForm, phone: parsePhoneInput(v) })} error={errors.phone} />
                      <Field label={t('cart.form_city')} required value={kzForm.city} onChange={(v) => setKzForm({ ...kzForm, city: sanitizeCity(v) })} error={errors.city} />
                      <Field label={t('cart.form_street')} required value={kzForm.street} onChange={(v) => setKzForm({ ...kzForm, street: sanitizeStreet(v) })} error={errors.street} />
                      <Field label={t('cart.form_house')} required value={kzForm.house} onChange={(v) => setKzForm({ ...kzForm, house: sanitizeDigitsLen(v, 3) })} error={errors.house} />
                      <Field label={t('cart.form_apt')} value={kzForm.apartment} onChange={(v) => setKzForm({ ...kzForm, apartment: sanitizeDigitsLen(v, 3) })} error={errors.apartment} />
                      <Field label={t('cart.form_zip')} required value={kzForm.postal_code} onChange={(v) => setKzForm({ ...kzForm, postal_code: sanitizeDigitsLen(v, 6) })} error={errors.postal_code} />
                    </div>
                  )}

                  {method === 'city' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      <Field label={t('cart.form_address')} required value={cityForm.address} onChange={(v) => setCityForm({ ...cityForm, address: sanitizeStreet(v) })} error={errors.address} />
                      <Field label={t('cart.form_recipient_phone')} required value={formatPhoneKaz(cityForm.phone)} onChange={(v) => setCityForm({ ...cityForm, phone: parsePhoneInput(v) })} error={errors.phone} />
                      <Field label={t('cart.form_entrance')} value={cityForm.entrance} onChange={(v) => setCityForm({ ...cityForm, entrance: sanitizeDigitsLen(v, 2) })} error={errors.entrance} />
                      <Field label={t('cart.form_apt_office')} value={cityForm.apartment} onChange={(v) => setCityForm({ ...cityForm, apartment: sanitizeDigitsLen(v, 3) })} error={errors.apartment} />
                      <Field label={t('cart.form_floor')} value={cityForm.floor} onChange={(v) => setCityForm({ ...cityForm, floor: sanitizeDigitsLen(v, 2) })} error={errors.floor} />
                      <Field label={t('cart.form_intercom')} value={cityForm.intercom} onChange={(v) => setCityForm({ ...cityForm, intercom: sanitizeIntercom(v) })} error={errors.intercom} />
                      <Field label={t('cart.form_comment')} value={cityForm.comment} onChange={(v) => setCityForm({ ...cityForm, comment: v })} multiline />
                      <div style={{ color: '#6b7280', fontSize: 13, gridColumn: '1 / -1' }}>{t('cart.delivery_calc_msg')}</div>
                    </div>
                  )}

                  {method === 'pickup' && (
                    <div className="checkout-form" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.04)'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1D1D1F',
                          marginBottom: '16px'
                        }}>{t('cart.who_pickup')}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '16px',
                            background: pickupSelf ? 'rgba(0, 122, 255, 0.08)' : '#FFFFFF',
                            borderRadius: '12px',
                            border: pickupSelf ? '2px solid #007AFF' : '1px solid rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.25s ease',
                            WebkitTapHighlightColor: 'transparent'
                          }}>
                            <input
                              type="radio"
                              checked={pickupSelf}
                              onChange={() => setPickupSelf(true)}
                              style={{
                                width: '20px',
                                height: '20px',
                                accentColor: '#007AFF'
                              }}
                            />
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: pickupSelf ? '#007AFF' : '#1D1D1F'
                              }}>{t('cart.pickup_me')}</div>
                              <div style={{
                                fontSize: '14px',
                                color: '#86868B',
                                marginTop: '2px'
                              }}>{t('cart.pickup_me_desc')}</div>
                            </div>
                          </label>

                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '16px',
                            background: !pickupSelf ? 'rgba(0, 122, 255, 0.08)' : '#FFFFFF',
                            borderRadius: '12px',
                            border: !pickupSelf ? '2px solid #007AFF' : '1px solid rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.25s ease',
                            WebkitTapHighlightColor: 'transparent'
                          }}>
                            <input
                              type="radio"
                              checked={!pickupSelf}
                              onChange={() => { setPickupSelf(false); setPickupForm({ first_name: '', last_name: '', middle_name: '', phone: '', comment: '' }) }}
                              style={{
                                width: '20px',
                                height: '20px',
                                accentColor: '#007AFF'
                              }}
                            />
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: !pickupSelf ? '#007AFF' : '#1D1D1F'
                              }}>{t('cart.pickup_other')}</div>
                              <div style={{
                                fontSize: '14px',
                                color: '#86868B',
                                marginTop: '2px'
                              }}>{t('cart.pickup_other_desc')}</div>
                            </div>
                          </label>
                        </div>
                      </div>
                      {!pickupSelf && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                          <Field label={t('cart.form_name')} required value={pickupForm.first_name} onChange={(v) => setPickupForm({ ...pickupForm, first_name: sanitizeLetters(v) })} error={errors.first_name} />
                          <Field label={t('cart.form_surname')} required value={pickupForm.last_name} onChange={(v) => setPickupForm({ ...pickupForm, last_name: sanitizeLetters(v) })} error={errors.last_name} />
                          <Field label={t('cart.form_middlename')} value={pickupForm.middle_name} onChange={(v) => setPickupForm({ ...pickupForm, middle_name: sanitizeLetters(v) })} error={errors.middle_name} />
                          <Field label={t('cart.form_phone')} required value={formatPhoneKaz(pickupForm.phone)} onChange={(v) => setPickupForm({ ...pickupForm, phone: parsePhoneInput(v) })} error={errors.phone} />
                          <Field label={t('cart.form_comment')} value={pickupForm.comment} onChange={(v) => setPickupForm({ ...pickupForm, comment: v })} multiline />
                        </div>
                      )}

                      {/* Информация о самовывозе */}
                      <div style={{
                        padding: '20px',
                        background: 'rgba(48, 209, 88, 0.08)',
                        borderRadius: '16px',
                        border: '1px solid rgba(48, 209, 88, 0.2)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '20px' }}>📍</span>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#30D158'
                          }}>{t('cart.pickup_addr_title')}</div>
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#1D1D1F',
                          fontWeight: '500',
                          lineHeight: 1.5
                        }}>
                          {t('cart.pickup_loc_city')}<br />
                          {t('cart.pickup_loc_street')}
                        </div>
                      </div>

                      <div style={{
                        padding: '20px',
                        background: 'rgba(0, 122, 255, 0.08)',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 122, 255, 0.2)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>🎁</span>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#007AFF'
                          }}>{t('cart.bonus_program_title')}</div>
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#1D1D1F',
                          fontWeight: '400',
                          lineHeight: 1.5
                        }}>
                          {t('cart.bonus_program_desc_1')}<br />
                          <strong>{t('cart.bonus_program_bold')}</strong> {t('cart.bonus_program_desc_2')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Инструкции по оплате */}
                  <div style={{
                    marginTop: '24px',
                    padding: '28px',
                    background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.06) 0%, rgba(48, 209, 88, 0.06) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(0, 122, 255, 0.15)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #007AFF 0%, #30D158 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
                      }}>💳</div>
                      <div style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#1D1D1F',
                        letterSpacing: '-0.3px'
                      }}>{t('cart.pay_title')}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Kaspi */}
                      <div style={{
                        padding: '20px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}>
                        <img
                          src={kaspiLogo}
                          alt="Kaspi"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1D1D1F',
                            marginBottom: '4px'
                          }}>Kaspi: 776-888-30-07</div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '16px'
                            }}>👤</span>
                            <span style={{
                              fontSize: '15px',
                              color: '#86868B',
                              fontWeight: '500'
                            }}>{t('cart.recipient_name')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Halyk */}
                      <div style={{
                        padding: '20px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}>
                        <img
                          src={halykLogo}
                          alt="Halyk"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1D1D1F',
                            marginBottom: '4px'
                          }}>Halyk: 776-888-30-07</div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '16px'
                            }}>👤</span>
                            <span style={{
                              fontSize: '15px',
                              color: '#86868B',
                              fontWeight: '500'
                            }}>{t('cart.recipient_name')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Freedom */}
                      <div style={{
                        padding: '20px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}>
                        <img
                          src={freedomIcon}
                          alt="Freedom"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1D1D1F',
                            marginBottom: '4px'
                          }}>Freedom: 776-888-30-07</div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '16px'
                            }}>👤</span>
                            <span style={{
                              fontSize: '15px',
                              color: '#86868B',
                              fontWeight: '500'
                            }}>{t('cart.recipient_name')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '20px',
                      padding: '16px 20px',
                      background: 'rgba(0, 122, 255, 0.08)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 122, 255, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        color: '#1D1D1F',
                        fontWeight: '500',
                        lineHeight: 1.5,
                        textAlign: 'center'
                      }}>
                        {t('cart.pay_instruction_1')}<strong style={{ color: '#007AFF' }}>{t('cart.paid_btn')}</strong>{t('cart.pay_instruction_2')}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '32px',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '28px',
                          fontWeight: '700',
                          color: '#000000',
                          letterSpacing: '-1px'
                        }}>{t('cart.to_pay_title')} {(toPay).toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-US' : 'ru-RU')} ₸</div>
                        {method === 'kz' && (
                          <div style={{
                            fontSize: '14px',
                            color: '#86868B',
                            fontWeight: '500',
                            marginTop: '4px'
                          }}>{t('cart.include_delivery')}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button onClick={closeCheckout} style={{
                        padding: '14px 20px',
                        borderRadius: '14px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        background: '#F5F5F7',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#1D1D1F',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E5EA'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.transform = 'translateY(0)' }}
                        onTouchStart={(e) => { e.currentTarget.style.background = '#E5E5EA'; e.currentTarget.style.transform = 'scale(0.95)' }}
                        onTouchEnd={(e) => { e.currentTarget.style.background = '#F5F5F7'; e.currentTarget.style.transform = 'scale(1)' }}>
                        {t('cart.cancel')}
                      </button>
                      <button
                        onClick={placeOrder}
                        disabled={isPlacing}
                        style={{
                          padding: '14px 28px',
                          borderRadius: '14px',
                          border: 'none',
                          background: isPlacing ? '#8E8E93' : 'linear-gradient(180deg, #30D158 0%, #28A745 100%)',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          fontSize: '16px',
                          cursor: isPlacing ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          letterSpacing: '-0.2px',
                          boxShadow: isPlacing ? 'none' : '0 4px 12px rgba(48, 209, 88, 0.25)',
                          WebkitTapHighlightColor: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: isPlacing ? 0.8 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isPlacing) {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(48, 209, 88, 0.35)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPlacing) {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(48, 209, 88, 0.25)'
                          }
                        }}
                        onTouchStart={(e) => {
                          if (!isPlacing) {
                            e.currentTarget.style.transform = 'scale(0.96)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(48, 209, 88, 0.2)'
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (!isPlacing) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(48, 209, 88, 0.25)'
                          }
                        }}>
                        {isPlacing ? (
                          <>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid #FFFFFF',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }} />
                            {t('common.processing') || 'Обработка...'}
                          </>
                        ) : (
                          <>💳 {t('cart.paid_btn')}</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'rgba(48, 209, 88, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(48, 209, 88, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🎁</span>
                    <div style={{
                      fontSize: '14px',
                      color: '#30D158',
                      fontWeight: '600'
                    }}>{t('cart.bonus_program_footer')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно успешной покупки */}
        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{
              width: '90%',
              maxWidth: '400px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '40px 32px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
              animation: 'modalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Анимированная иконка */}
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #30D158 0%, #28A745 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(48, 209, 88, 0.3)',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                ✓
              </div>

              {/* Заголовок */}
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1D1D1F',
                marginBottom: '16px',
                letterSpacing: '-0.5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                {t('cart.success_title')}
              </h2>

              {/* Описание */}
              <div style={{
                fontSize: '18px',
                color: '#86868B',
                lineHeight: 1.5,
                marginBottom: '32px',
                fontWeight: '500'
              }}>
                <p style={{ margin: '0 0 12px 0' }}>{t('cart.success_desc_1')}</p>
                <p style={{ margin: '0 0 12px 0' }}>{t('cart.success_desc_2')}</p>
              </div>

              {/* Подпись */}
              <div style={{
                fontSize: '16px',
                color: '#007AFF',
                fontWeight: '600',
                fontStyle: 'italic',
                marginBottom: '32px'
              }}>
                {t('cart.success_sign')}
              </div>

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  onClick={() => { setShowSuccessModal(false); navigate('/track') }}
                  style={{
                    padding: '16px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '17px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '-0.3px',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3)'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.96)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.2)'
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  {t('cart.success_track_btn')}
                </button>

                <button
                  onPointerDown={() => { setShowSuccessModal(false); navigate('/storedashboard') }}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    background: '#F5F5F7',
                    color: '#1D1D1F',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E5E5EA';
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F5F5F7';
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.background = '#E5E5EA';
                    e.currentTarget.style.transform = 'scale(0.96)'
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.background = '#F5F5F7';
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  {t('cart.success_close_btn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* iOS/Admin-style Confirmation Modal */}
        {confirmModal.show && (
          <div onClick={cancelConfirm} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out',
            padding: '20px'
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: '90%',
              maxWidth: '360px',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
              animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              {/* Icon */}
              <div style={{
                width: '60px',
                height: '60px',
                background: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '30px'
              }}>
                {confirmModal.type === 'item' ? '🗑️' : '🧹'}
              </div>

              {/* Title and Description */}
              <h2 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1c1c1e',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
                {confirmModal.type === 'item' ? t('cart.confirm_delete_title') : t('cart.confirm_clear_title')}
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#3a3a3c',
                marginBottom: '24px',
                lineHeight: '1.4',
                padding: '0 10px'
              }}>
                {confirmModal.type === 'item' ? t('cart.confirm_delete_desc') : t('cart.confirm_clear_desc')}
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={confirmAction} style={{
                  width: '100%',
                  padding: '14px',
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                  onMouseOver={(e) => e.target.style.opacity = '0.9'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  {confirmModal.type === 'item' ? t('cart.confirm_delete') : t('cart.clear')}
                </button>
                <button onClick={cancelConfirm} style={{
                  width: '100%',
                  padding: '14px',
                  background: '#f2f2f7',
                  color: '#007aff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                  onMouseOver={(e) => e.target.style.background = '#e5e5ea'}
                  onMouseOut={(e) => e.target.style.background = '#f2f2f7'}
                >
                  {t('cart.confirm_cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout confirmation modal */}
        {showLogoutConfirm && (
          <div onClick={() => setShowLogoutConfirm(false)} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out',
            padding: '20px'
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: '90%',
              maxWidth: '360px',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
              animation: 'modalSlideIn 0.3s ease-out'
            }}>
              {/* Icon */}
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f2f2f7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '30px'
              }}>
                👋
              </div>

              <h2 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1c1c1e',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
                {t('profile.logout_confirm_title') || 'Выйти из аккаунта?'}
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#3a3a3c',
                marginBottom: '24px',
                lineHeight: '1.4',
                padding: '0 10px'
              }}>
                {t('profile.logout_confirm_msg') || 'Вы уверены, что хотите выйти? Вам придется снова войти в систему.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={handleLogout} style={{
                  width: '100%',
                  padding: '14px',
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                  onMouseOver={(e) => e.target.style.opacity = '0.9'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  {t('profile.logout') || 'Выйти'}
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} style={{
                  width: '100%',
                  padding: '14px',
                  background: '#f2f2f7',
                  color: '#007aff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                  onMouseOver={(e) => e.target.style.background = '#e5e5ea'}
                  onMouseOut={(e) => e.target.style.background = '#f2f2f7'}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Вспомогательный компонент поля ввода
function Field({ label, required, value, onChange, error, placeholder, multiline }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontSize: '14px',
        color: '#1D1D1F',
        fontWeight: '600',
        letterSpacing: '-0.2px'
      }}>
        {label}
        {required && <span style={{ color: '#FF3B30', marginLeft: '4px' }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            border: error ? '2px solid #FF3B30' : '1px solid rgba(0, 0, 0, 0.08)',
            background: '#FFFFFF',
            minHeight: '80px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#1D1D1F',
            transition: 'all 0.25s ease',
            outline: 'none',
            resize: 'vertical',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007AFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#FF3B30' : 'rgba(0, 0, 0, 0.08)';
            e.target.style.boxShadow = 'none'
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            border: error ? '2px solid #FF3B30' : '1px solid rgba(0, 0, 0, 0.08)',
            background: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '500',
            color: '#1D1D1F',
            transition: 'all 0.25s ease',
            outline: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007AFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#FF3B30' : 'rgba(0, 0, 0, 0.08)';
            e.target.style.boxShadow = 'none'
          }}
        />
      )}
      {error && (
        <div style={{
          color: '#FF3B30',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  )
}
