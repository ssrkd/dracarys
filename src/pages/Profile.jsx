import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'
import bcrypt from 'bcryptjs'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'

export default function Profile({ customer, onLogout, hideHeader = false }) {
  const { t, setLang, lang } = useLang()
  if (!hideHeader) usePageTitle(t('profile.title') || 'Профиль')
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showLangSelector, setShowLangSelector] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profile, setProfile] = useState(customer || {})
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [firstNameInput, setFirstNameInput] = useState('')
  const [lastNameInput, setLastNameInput] = useState('')
  const [avatarData, setAvatarData] = useState(null) // preview DataURL до сохранения
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)

  // Clear form when modal closes
  useEffect(() => {
    if (!showSecurityModal) {
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      setPasswordSuccess('')
      setShowOldPass(false)
      setShowNewPass(false)
      setShowConfirmPass(false)
    }
  }, [showSecurityModal])

  const formatPhone = (phone) => {
    if (!phone) return ''
    // Очищаем от всех нецифр
    const d = String(phone).replace(/\D/g, '')
    if (d.length !== 11) return phone // Если не 11 цифр, возвращаем как есть

    // Формат: 8-776-888-30-07
    const operator = d.slice(1, 4)
    const part1 = d.slice(4, 7)
    const part2 = d.slice(7, 9)
    const part3 = d.slice(9, 11)

    return `8-${operator}-${part1}-${part2}-${part3}`
  }

  const formatDate = (dateString, fieldName = 'unknown') => {
    if (!dateString) return 'Не указана'

    let date = null

    // Проверяем, если это формат DD.MM.YYYY или DD.MM.YY
    if (typeof dateString === 'string' && dateString.includes('.')) {
      const parts = dateString.split('.')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // месяцы в JS начинаются с 0
        let year = parseInt(parts[2], 10)

        // Если год двузначный, добавляем 2000
        if (year < 100) {
          year += 2000
        }

        date = new Date(year, month, day)
      }
    }

    // Если не получилось с точками, пробуем стандартный парсинг
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateString)

      // Если все еще невалидная, пробуем ISO формат
      if (isNaN(date.getTime()) && typeof dateString === 'string') {
        date = new Date(dateString + 'T00:00:00.000Z')
      }
    }

    if (!date || isNaN(date.getTime())) {
      return 'Не указана'
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Отладочная информация для профиля (можно удалить после тестирования)
  useEffect(() => {
    if (profile.birth_date) {
      console.log('Birth date:', profile.birth_date, 'formatted:', formatDate(profile.birth_date, 'birth_date'))
    }
  }, [profile.birth_date])

  const formatCardNumber = (num) => {
    if (!num) return 'Не назначен'
    const digits = String(num).replace(/\D/g, '')
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const maskedCardNumber = (num) => {
    if (!num) return 'Не назначен'
    const d = String(num).replace(/\D/g, '')
    if (d.length < 8) return formatCardNumber(d)
    const first = d.slice(0, 4)
    const last = d.slice(-4)
    return `${first} •••• •••• ${last}`
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!customer) return
      try {
        setLoadingProfile(true)
        let fetched = null

        if (customer.id) {
          const { data } = await supabase
            .from('customers')
            .select('id, fullname, phone, card_number, bonus_balance, total_spent, created_at, registration_date, last_purchase_date, birth_date')
            .eq('id', customer.id)
            .single()
          if (data) fetched = data
        }

        if (!fetched && customer.phone) {
          const raw = String(customer.phone)
          const onlyDigits = raw.replace(/\D/g, '')
          const withPlus = raw.startsWith('+') ? raw : '+' + onlyDigits
          const variants = [raw, onlyDigits, withPlus]

          for (const ph of variants) {
            const { data } = await supabase
              .from('customers')
              .select('id, fullname, phone, card_number, bonus_balance, total_spent, created_at, registration_date, last_purchase_date, birth_date')
              .eq('phone', ph)
              .maybeSingle()
            if (data) { fetched = data; break }
          }
        }

        if (fetched) {
          setProfile({ ...fetched })
          await recomputeFromLedger(fetched.id)
          setTimeout(() => { recomputeFromLedger(fetched.id) }, 350)
        }
      } catch (_) {
        // ignore
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [customer?.id, customer?.phone])

  // Быстрая подстраховка: короткий пуллинг после захода на профиль, чтобы поймать свежие изменения
  useEffect(() => {
    if (!profile?.id) return
    let ticks = 0
    const maxTicks = 10 // ~5 секунд при 500мс
    const timer = setInterval(async () => {
      ticks++
      // подтянуть строку клиента
      try {
        const { data } = await supabase
          .from('customers')
          .select('id, fullname, phone, card_number, bonus_balance, total_spent, created_at, registration_date, last_purchase_date, birth_date')
          .eq('id', profile.id)
          .maybeSingle()
        if (data) setProfile(prev => ({ ...prev, ...data }))
      } catch (_) { }
      await recomputeFromLedger(profile.id)
      if (ticks >= maxTicks) clearInterval(timer)
    }, 500)
    return () => clearInterval(timer)
  }, [profile?.id])

  // Общий пересчет из ledger
  const recomputeFromLedger = async (cid) => {
    try {
      const { data: rows } = await supabase
        .from('bonuses_ledger')
        .select('type, amount, status, created_at')
        .eq('customer_id', cid)

      if (Array.isArray(rows)) {
        let total = 0
        let lastDate = null
        for (const r of rows) {
          if (r.status === 'active') {
            if (r.type === 'credit') total += (r.amount || 0)
            else if (r.type === 'debit' || r.type === 'reversal') total -= (r.amount || 0)
          }
          const dt = r.created_at ? new Date(r.created_at) : null
          if (dt && (!lastDate || dt > lastDate)) lastDate = dt
        }
        const patch = { bonus_balance: total }
        if (lastDate) patch.last_purchase_date = lastDate.toISOString()
        setProfile(prev => ({ ...prev, ...patch }))
      }
    } catch (_) { }
  }

  // Принудительное обновление при фокусе окна / возвращении вкладки / изменении локального кеша
  useEffect(() => {
    const onFocus = () => {
      if (profile?.id) {
        // Подтянуть свежие данные профиля и пересчитать из ledger
        supabase.from('customers').select('id, fullname, phone, card_number, bonus_balance, total_spent, created_at, registration_date, last_purchase_date, birth_date').eq('id', profile.id).maybeSingle().then(({ data }) => {
          if (data) setProfile(prev => ({ ...prev, ...data }))
        })
        recomputeFromLedger(profile.id)
      }
    }
    const onVisibility = () => { if (document.visibilityState === 'visible') onFocus() }
    const onStorage = (e) => { if (e.key === 'qaraa_customer') onFocus() }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [profile?.id])

  // Live updates for bonuses and profile changes
  useEffect(() => {
    if (!profile?.id) return
    const ch = supabase
      .channel('realtime-bonuses-' + profile.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bonuses_ledger', filter: 'customer_id=eq.' + profile.id }, async () => {
        try {
          // При любой новой записи пересчитываем и бонусы, и последнюю покупку
          const { data: rows } = await supabase
            .from('bonuses_ledger')
            .select('type, amount, status, created_at')
            .eq('customer_id', profile.id)
          if (Array.isArray(rows)) {
            let total = 0
            let lastDate = null
            for (const r of rows) {
              if (r.status === 'active') {
                if (r.type === 'credit') total += (r.amount || 0)
                else if (r.type === 'debit' || r.type === 'reversal') total -= (r.amount || 0)
              }
              const dt = r.created_at ? new Date(r.created_at) : null
              if (dt && (!lastDate || dt > lastDate)) lastDate = dt
            }
            const patch = { bonus_balance: total }
            if (lastDate) patch.last_purchase_date = lastDate.toISOString()
            setProfile(prev => ({ ...prev, ...patch }))
          }
        } catch (_) { }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'customers', filter: 'id=eq.' + profile.id }, async (payload) => {
        try {
          const { bonus_balance, last_purchase_date } = payload.new || {}
          const patch = {}
          if (typeof bonus_balance === 'number') patch.bonus_balance = bonus_balance
          if (last_purchase_date) patch.last_purchase_date = last_purchase_date
          if (Object.keys(patch).length) setProfile(prev => ({ ...prev, ...patch }))
        } catch (_) { }
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(ch) } catch (_) { }
    }
  }, [profile?.id])

  const handleLogout = () => {
    // Просто вызываем проп, редирект сделает App через роутинг (так как customer станет null)
    if (onLogout) onLogout()
  }

  useEffect(() => {
    setAvatarData(null)
    setAvatarFile(null)
  }, [profile.id])


  // Скролл к началу при загрузке
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Определение мобильной версии
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Effect to sync inputs when editing starts
  useEffect(() => {
    if (showEdit && profile) {
      setFirstNameInput(profile.first_name || '')
      setLastNameInput(profile.last_name || '')
    }
  }, [showEdit, profile])

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setAvatarData(dataUrl)
      setAvatarFile(file)
    }
    reader.readAsDataURL(file)
  }

  const saveProfileChanges = async () => {
    try {
      let newAvatarUrl = null
      if (avatarFile && profile.id) {
        setAvatarUploading(true)
        const ext = (avatarFile.name.split('.').pop() || 'jpg').toLowerCase()
        const path = `customers/${profile.id}/avatar_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type || 'image/jpeg'
        })
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
        newAvatarUrl = pub?.publicUrl || null
      }

      if (profile.id) {
        const patch = {}
        if (firstNameInput !== profile.first_name) patch.first_name = firstNameInput
        if (lastNameInput !== profile.last_name) patch.last_name = lastNameInput

        // Update fullname as well for backward compatibility if needed, though best to rely on first/last
        if (patch.first_name || patch.last_name) {
          patch.fullname = `${firstNameInput} ${lastNameInput}`.trim()
        }

        if (newAvatarUrl) patch.avatar_url = newAvatarUrl
        if (Object.keys(patch).length) {
          const { error } = await supabase.from('customers').update(patch).eq('id', profile.id)
          if (error) throw error
        }

        const updatedProfile = { ...profile, ...patch, ...(newAvatarUrl ? { avatar_url: newAvatarUrl } : {}) }
        setProfile(updatedProfile)
        localStorage.setItem('qaraa_customer', JSON.stringify(updatedProfile))
        setShowEdit(false)
      }
    } catch (_) {
      setShowEdit(false)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError(t('security.passwords_mismatch'))
      return
    }

    if (newPassword.length < 6) {
      setPasswordError(t('security.password_too_short'))
      return
    }

    try {
      setUpdatingPassword(true)

      // 1. Verify old password using bcrypt
      const isPasswordCorrect = await bcrypt.compare(oldPassword, profile.password)

      if (!isPasswordCorrect) {
        setPasswordError(t('security.incorrect_password'))
        return
      }

      // 2. Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // 3. Update in customers table
      const { error } = await supabase
        .from('customers')
        .update({ password: hashedNewPassword })
        .eq('id', profile.id)

      if (error) throw error

      // Update local state and localStorage
      const updatedProfile = { ...profile, password: hashedNewPassword }
      setProfile(updatedProfile)
      localStorage.setItem('qaraa_customer', JSON.stringify(updatedProfile))

      setPasswordSuccess(t('security.success') || 'Пароль успешно изменен')
      setTimeout(() => {
        setShowSecurityModal(false)
      }, 2000)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        
        .profile-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        .profile-button {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .profile-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .profile-button:active {
          transform: translateY(0);
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .cart-header-container { 
            padding: 12px 16px !important; 
            min-height: 60px !important;
          }
          .profile-stats { grid-template-columns: 1fr !important; }
          .profile-actions { 
            grid-template-columns: 1fr !important; 
            gap: 12px !important;
          }
          
          /* Card bonus styles to match CardInfo.jsx */
          .profile-card-bonus-label {
            fontSize: '12px !important';
            opacity: 0.7 !important;
            marginBottom: '4px !important';
            marginTop: '16px !important';
          }
          .profile-card-bonus-value {
            fontSize: '32px !important';
            fontWeight: '700 !important';
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          .profile-card:hover { transform: none !important; }
          .profile-card:active { 
            transform: scale(0.98) !important;
            transition: transform 0.1s ease !important;
          }
          .profile-button:hover { transform: none !important; }
          .profile-button:active {
            transform: scale(0.95) !important;
            transition: transform 0.1s ease !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#F8F9FA',
        paddingBottom: 'env(safe-area-inset-bottom, 40px)'
      }}>
        {/* Header */}
        {!hideHeader && (
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
            transition: 'all 0.3s ease'
          }}>
            <div className="cart-header-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div onClick={() => navigate('/dashboard')} style={{
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
                {/* Logo removed as requested */}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
                {/* 3 dots menu button removed as requested */}
              </div>
            </div>
          </header>
        )}

        {/* Edit modal */}
        {showEdit && (
          <div
            onClick={() => setShowEdit(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: '92%', maxWidth: '420px', background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #E5E5EA' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Редактировать профиль</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                {avatarData || profile.avatar_url ? (
                  <img src={avatarData || profile.avatar_url} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E5EA' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F2F2F7', border: '1px solid #E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <label style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer', color: '#0051D5' }}>
                  Загрузить аватар
                  <input type="file" accept="image/*" onChange={onPickAvatar} style={{ display: 'none' }} />
                </label>
                {avatarData && (
                  <button onClick={() => { setAvatarData(null); setAvatarFile(null) }} style={{ marginLeft: 'auto', border: '1px solid #E5E5EA', background: '#fff', borderRadius: '10px', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>Отменить</button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>{t('profile.first_name')}</label>
                  <input
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(capitalize(e.target.value))}
                    placeholder={t('profile.first_name')}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>{t('profile.last_name')}</label>
                  <input
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(capitalize(e.target.value))}
                    placeholder={t('profile.last_name')}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>{t('profile.reg_date') || 'Дата регистрации'}</label>
                <div style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #F2F2F7',
                  fontSize: '14px', background: '#F9F9F9', color: '#8E8E93'
                }}>
                  {formatDate(profile.registration_date || profile.created_at)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>{t('profile.birth_date') || 'Дата рождения'}</label>
                <div style={{
                  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #F2F2F7',
                  fontSize: '14px', background: '#F9F9F9', color: '#8E8E93'
                }}>
                  {formatDate(profile.birth_date)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Отмена</button>
                <button onClick={saveProfileChanges} disabled={avatarUploading} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: avatarUploading ? '#9CA3AF' : 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)', color: '#fff', fontWeight: 800, cursor: avatarUploading ? 'not-allowed' : 'pointer' }}>{avatarUploading ? 'Загрузка...' : 'Сохранить'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Security modal */}
        {showSecurityModal && (
          <div
            onClick={() => setShowSecurityModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn 0.3s ease' }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{t('security.title')}</h2>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  style={{ background: '#F2F2F7', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', paddingLeft: '4px' }}>{t('security.current_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOldPass ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '16px', border: '1px solid #E5E5EA', fontSize: '16px', outline: 'none', background: '#F9F9F9' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showOldPass ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', paddingLeft: '4px' }}>{t('security.new_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '16px', border: '1px solid #E5E5EA', fontSize: '16px', outline: 'none', background: '#F9F9F9' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showNewPass ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', paddingLeft: '4px' }}>{t('security.confirm_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '16px', border: '1px solid #E5E5EA', fontSize: '16px', outline: 'none', background: '#F9F9F9' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showConfirmPass ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div style={{ padding: '12px 16px', background: '#FFF2F2', borderRadius: '12px', color: '#FF3B30', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div style={{ padding: '12px 16px', background: '#F2FFF2', borderRadius: '12px', color: '#34C759', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {passwordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingPassword}
                  style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '16px',
                    border: 'none',
                    background: updatingPassword ? '#AEAEB2' : 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
                    color: '#fff',
                    fontSize: '17px',
                    fontWeight: '700',
                    cursor: updatingPassword ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)',
                    marginTop: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { if (!updatingPassword) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {updatingPassword ? '...' : t('security.update_btn')}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Profile Section */}
        {/* Minimalist Profile Header */}
        <div style={{
          padding: '40px 24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          animation: 'fadeIn 0.8s ease-out',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* Avatar Area */}
          <div
            onClick={() => setShowEdit(true)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#8E8E93',
                fontWeight: '600',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}>
                {(profile.fullname || profile.first_name || 'П').charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '22px',
              height: '22px',
              background: '#007AFF',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#1D1D1F',
              margin: '0 0 2px 0',
              letterSpacing: '-0.5px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {(`${profile.first_name || ''} ${profile.last_name || ''}`.trim()) || profile.fullname || t('profile.user') || 'Пользователь'}
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#86868B',
              fontWeight: '500',
              margin: 0
            }}>
              {formatPhone(profile.phone)}
            </p>
          </div>
        </div>

        {/* Minimalist Action List */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 16px 60px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            {/* Account Settings */}
            <button
              onClick={() => setShowEdit(true)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                borderBottom: '1px solid #F2F2F7',
                transition: 'background 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#1D1D1F', flex: 1, textAlign: 'left' }}>
                {lang === 'kk' ? 'Есептік жазба параметрлері' : lang === 'ru' ? 'Настройки учетной записи' : 'Account Settings'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Language */}
            <button
              onClick={() => setShowLangSelector(true)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                borderBottom: '1px solid #F2F2F7',
                transition: 'background 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#1D1D1F', flex: 1, textAlign: 'left' }}>
                {lang === 'kk' ? 'Тілді таңдау' : lang === 'ru' ? 'Выбор языка' : 'Language'}
              </span>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#8E8E93' }}>
                {lang === 'kk' ? 'Қаз' : lang === 'ru' ? 'Рус' : 'Eng'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Security */}
            <button
              onClick={() => setShowSecurityModal(true)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                borderBottom: '1px solid #F2F2F7',
                transition: 'background 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#1D1D1F', flex: 1, textAlign: 'left' }}>
                {lang === 'kk' ? 'Қауіпсіздік' : lang === 'ru' ? 'Безопасность' : 'Security'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Support */}
            <button
              onClick={() => setShowSupportModal(true)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                borderBottom: '1px solid #F2F2F7',
                transition: 'background 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9F9F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', background: '#F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#1D1D1F', flex: 1, textAlign: 'left' }}>
                {lang === 'kk' ? 'Қолдау' : lang === 'ru' ? 'Поддержка' : 'Support'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', background: '#FFF5F5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#FF3B30', flex: 1, textAlign: 'left' }}>
                {lang === 'kk' ? 'Шығу' : lang === 'ru' ? 'Выйти' : 'Logout'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Language Selector Modal */}
        {showLangSelector && (
          <div
            onClick={() => setShowLangSelector(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)', zIndex: 3000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: '24px', padding: '24px',
                width: '100%', maxWidth: '340px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
                {t('profile.select_language') || 'Выберите язык'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
                  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                  { code: 'en', name: 'English', flag: '🇺🇸' }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code)
                      setShowLangSelector(false)
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: lang === item.code ? '2px solid #007AFF' : '1px solid #F2F2F7',
                      background: lang === item.code ? 'rgba(0, 122, 255, 0.05)' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{item.flag}</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: lang === item.code ? '700' : '500',
                      color: lang === item.code ? '#007AFF' : '#1D1D1F'
                    }}>{item.name}</span>
                    {lang === item.code && (
                      <div style={{ marginLeft: 'auto', color: '#007AFF' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLangSelector(false)}
                style={{
                  width: '100%', marginTop: '20px', padding: '12px',
                  borderRadius: '12px', border: 'none', background: '#F2F2F7',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                {t('common.close') || 'Закрыть'}
              </button>
            </div>
          </div>
        )}

        {/* Support modal */}
        {showSupportModal && (
          <div
            onClick={() => setShowSupportModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 2000,
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                textAlign: 'center'
              }}
            >
              {/* Иконка поддержки */}
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(108, 117, 125, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(108, 117, 125, 0.2)'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
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
                {t('support.title') || 'Поддержка'}
              </h2>

              {/* Описание */}
              <p style={{
                fontSize: '18px',
                color: '#86868B',
                lineHeight: 1.5,
                marginBottom: '32px',
                fontWeight: '500'
              }}>
                {t('support.description') || 'Свяжитесь с нами в Telegram для получения помощи'}
              </p>

              {/* Telegram контакт */}
              <div style={{
                background: 'rgba(0, 136, 204, 0.1)',
                border: '1px solid rgba(0, 136, 204, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#0088CC',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 7.886-1.268 7.886-.16.708-.534.708-.534.708s-1.924-.64-2.746-1.176c-.534-.356-2.746-1.781-3.467-2.315-.356-.267-.712-.801.178-1.424 2.138-1.781 4.632-4.276 6.226-5.751.712-.658.356-1.07-.356-.658-2.49 1.781-6.584 4.454-7.662 5.145 0 0-1.246.801-3.556-.125-2.31-.926-3.2-1.424-3.2-1.424s-1.246-.801.89-1.602c0 0 8.552-3.556 11.476-4.72C17.368 7.182 17.724 8.16 17.568 8.16z" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1D1D1F',
                    marginBottom: '4px'
                  }}>
                    Telegram
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0088CC',
                    fontFamily: 'monospace'
                  }}>
                    @sssssrkd
                  </div>
                </div>
              </div>

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    window.open('https://t.me/sssssrkd', '_blank')
                    setShowSupportModal(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    background: '#0088CC',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#007BB5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0088CC'}
                >
                  {t('support.open_tg') || 'Открыть Telegram'}
                </button>

                <button
                  onClick={() => setShowSupportModal(false)}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    background: '#F2F2F7',
                    color: '#1D1D1F',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E5E5EA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F2F2F7'}
                >
                  {t('support.close') || 'Закрыть'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                color: '#000000',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {t('profile.logout_confirm_title') || 'Выйти из аккаунта?'}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8E8E93',
                marginBottom: '24px',
                textAlign: 'center',
                lineHeight: '1.5'
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
                    cursor: 'pointer'
                  }}
                >
                  {t('common.cancel') || 'Отмена'}
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
                    cursor: 'pointer'
                  }}
                >
                  {t('profile.logout') || 'Выйти'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
