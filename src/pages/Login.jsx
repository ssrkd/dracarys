import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AnimatedWaterBackground from '../components/AnimatedWaterBackground'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register'
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isStepTransitioning, setIsStepTransitioning] = useState(false)

  // Form states
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [currentStep, setCurrentStep] = useState(1) // 1: phone, 2: password (login) OR code (register)
  const [timeLeft, setTimeLeft] = useState(300)
  const [existingCustomer, setExistingCustomer] = useState(null)

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Timer for verification code
  useEffect(() => {
    if (currentStep === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, timeLeft])

  // Scroll to top on mount (fix mobile viewport)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Format phone number (Kazakhstan: must start with 7)
  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/\D/g, '')

    // If the first digit isn't 7, force it to be 7
    if (cleaned.length > 0 && cleaned[0] !== '7') {
      cleaned = '7' + cleaned.slice(1)
    }

    const limited = cleaned.slice(0, 10)

    if (limited.length === 0) return ''
    if (limited.length <= 3) return limited
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
  }

  const getCleanPhone = (formattedPhone) => {
    const digits = formattedPhone.replace(/\D/g, '')
    return '7' + digits
  }

  // Handle mode switching with animation
  const switchMode = () => {
    setIsTransitioning(true)
    // Synchronize state switch with the midpoint of the animation for maximum smoothness
    setTimeout(() => {
      setIsRegisterMode(!isRegisterMode)
      setPhone('')
      setPassword('')
      setVerificationCode('')
      setCurrentStep(1)
      setErrorMessage('')
      setExistingCustomer(null)
    }, 600)

    // Complete the transition state after the animation finishes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
  }

  const goToStep = (step) => {
    setIsStepTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsStepTransitioning(false)
    }, 300)
  }

  // Prefetch logic
  const prefetchRef = React.useRef(null)

  useEffect(() => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length >= 10) {
      const dbPhone = clean.length === 10 ? '7' + clean : clean
      if (prefetchRef.current?.phone === dbPhone) return

      const promise = supabase
        .from('customers')
        .select('*')
        .eq('phone', dbPhone)
        .maybeSingle()

      prefetchRef.current = { phone: dbPhone, promise }
    }
  }, [phone])

  // Handle Phone Submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanPhone = getCleanPhone(phone)
    const phoneDigits = cleanPhone.replace(/\D/g, '')

    if (phoneDigits.length < 11) {
      setErrorMessage('Введите корректный номер телефона')
      return
    }

    // Validate Kazakhstan number (must start with 77)
    if (!phoneDigits.startsWith('77')) {
      setErrorMessage('Номер должен начинаться с 77 (Казахстан)')
      return
    }

    setIsLoading(true)

    try {
      let customer, error

      if (prefetchRef.current?.phone === cleanPhone) {
        const res = await prefetchRef.current.promise
        customer = res.data
        error = res.error
      } else {
        const res = await supabase
          .from('customers')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle()
        customer = res.data
        error = res.error
      }

      if (error) throw error

      if (customer) {
        if (isRegisterMode) {
          setErrorMessage('Этот номер уже зарегистрирован')
        } else {
          // Login mode - go to password step
          setExistingCustomer(customer)
          goToStep(2)
        }
      } else {
        if (isRegisterMode) {
          // New registration - send WhatsApp code via API
          try {
            console.log('🔗 Отправка запроса на код для:', cleanPhone);
            const response = await fetch('http://localhost:43123/api/send-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: cleanPhone })
            });
            const data = await response.json();
            console.log('📩 Ответ от сервера бота:', data);

            if (!data.success) {
              setErrorMessage(data.message || 'Ошибка при отправке кода');
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.error('Initial code send failed:', err);
            setErrorMessage('Бот недоступен. Откройте WhatsApp на компьютере и запустите бота.');
            setIsLoading(false);
            return;
          }

          goToStep(2)
          setTimeLeft(300)
        } else {
          setErrorMessage('Аккаунт не найден. Зарегистрируйтесь')
        }
      }
    } catch (err) {
      setErrorMessage('Ошибка: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault()

    if (!password) return

    setErrorMessage('')
    setIsLoading(true)

    try {
      if (existingCustomer.is_banned) {
        setErrorMessage('Ваш аккаунт заблокирован администратором')
        setIsLoading(false)
        return
      }

      const bcrypt = await import('bcryptjs')
      const isPasswordCorrect = await bcrypt.compare(password, existingCustomer.password)

      if (isPasswordCorrect) {
        onLogin(existingCustomer)
        navigate('/dashboard')
      } else {
        setErrorMessage('Неверный пароль')
        setPassword('')
      }
    } catch (err) {
      setErrorMessage('Ошибка: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Code Verification
  const handleCodeVerification = async (e) => {
    e.preventDefault()

    if (!verificationCode || verificationCode.length !== 4) return

    setErrorMessage('')
    setIsLoading(true)

    try {
      const cleanPhone = getCleanPhone(phone)

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('verification_code', verificationCode)
        .eq('code_used', false)
        .gt('code_expires_at', new Date().toISOString())
        .maybeSingle()

      if (customerError) throw customerError

      if (!customer) {
        setErrorMessage('Неверный код или истек срок действия')
        return
      }

      await supabase
        .from('customers')
        .update({ code_used: true })
        .eq('phone', cleanPhone)

      // Success - login
      onLogin(customer)
      navigate('/dashboard')
    } catch (err) {
      setErrorMessage('Ошибка: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const cleanPhone = getCleanPhone(phone)

      const response = await fetch('http://localhost:43123/api/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const result = await response.json()

      if (result.success) {
        setTimeLeft(300)
        setErrorMessage('Новый код отправлен в WhatsApp!')
      } else {
        setErrorMessage(result.message || 'Ошибка при отправке кода')
      }
    } catch (err) {
      setErrorMessage('Откройте WhatsApp и отправьте любое сообщение боту')
    } finally {
      setIsLoading(false)
    }
  }

  // Shared input style
  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '15px',
    border: '2px solid #EEEEEE',
    borderRadius: '30px',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    transition: 'all 0.3s ease',
    backgroundColor: '#F5F5F5',
    marginBottom: '16px'
  }

  const buttonStyle = (isOutline = false, disabled = false) => ({
    width: '100%',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    border: isOutline ? '2px solid rgba(255, 255, 255, 0.8)' : 'none',
    borderRadius: '30px',
    background: disabled ? '#CCCCCC' : (isOutline ? 'transparent' : '#26C6DA'),
    color: '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    boxShadow: isOutline ? 'none' : '0 4px 15px rgba(38, 198, 218, 0.3)',
    opacity: disabled ? 0.6 : 1
  })

  const socialButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '2px solid #EEEEEE',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '20px'
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Side - switches position based on mode */}
      {isRegisterMode ? (
        <>
          {/* Left: Animated Background (Register mode) */}
          <div style={{
            flex: 1,
            transition: 'all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transform: isTransitioning ? 'translateX(100%) scale(0.95)' : 'translateX(0) scale(1)',
            opacity: isTransitioning ? 0 : 1,
            filter: isTransitioning ? 'blur(10px)' : 'blur(0)'
          }}>
            <AnimatedWaterBackground>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '16px',
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.6s ease'
              }}>
                Hello<br />friends
              </h1>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                marginBottom: '40px',
                textAlign: 'center',
                maxWidth: '300px',
                lineHeight: '1.6'
              }}>
                If you already have an account login here and have fun
              </p>
              <button
                onClick={switchMode}
                style={buttonStyle(true)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                ← Login
              </button>
            </AnimatedWaterBackground>
          </div>

          {/* Right: Register Form */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            padding: '40px',
            transition: 'all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transform: isTransitioning ? 'translateX(-100%) scale(1.05)' : 'translateX(0) scale(1)',
            opacity: isTransitioning ? 0 : 1,
            filter: isTransitioning ? 'blur(10px)' : 'blur(0)'
          }}>
            <div style={{
              maxWidth: '400px',
              width: '100%',
              opacity: isStepTransitioning ? 0 : 1,
              transform: isStepTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '40px',
                color: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                {currentStep === 1 ? 'Register here.' : 'Verify code.'}
              </h2>

              {currentStep === 1 ? (
                <form onSubmit={handlePhoneSubmit}>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '20px',
                      top: '48%',
                      transform: 'translateY(-50%)',
                      fontSize: '15px',
                      color: '#757575',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      +7
                    </div>
                    <input
                      type="tel"
                      placeholder="777-123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      style={{ ...inputStyle, paddingLeft: '50px' }}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#26C6DA'
                        e.target.style.backgroundColor = '#FFFFFF'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#EEEEEE'
                        e.target.style.backgroundColor = '#F5F5F5'
                      }}
                    />
                  </div>

                  {errorMessage && (
                    <div style={{
                      padding: '12px 20px',
                      background: '#FFEBEE',
                      color: '#C62828',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || phone.replace(/\D/g, '').length !== 10}
                    style={buttonStyle(false, isLoading || phone.replace(/\D/g, '').length !== 10)}
                    onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    {isLoading ? 'Отправка...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={isRegisterMode ? handleCodeVerification : handlePasswordLogin}>
                  <p style={{
                    fontSize: '14px',
                    color: '#757575',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    {isRegisterMode
                      ? `Мы отправили вам на WhatsApp код подтверждения:`
                      : `Введите пароль для +${getCleanPhone(phone)}`
                    }
                  </p>

                  {isRegisterMode ? (
                    <input
                      type="tel"
                      placeholder="0000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      style={{
                        ...inputStyle,
                        textAlign: 'center',
                        fontSize: '24px',
                        letterSpacing: '8px'
                      }}
                      maxLength={4}
                      autoFocus
                      onFocus={(e) => {
                        e.target.style.borderColor = '#26C6DA'
                        e.target.style.backgroundColor = '#FFFFFF'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#EEEEEE'
                        e.target.style.backgroundColor = '#F5F5F5'
                      }}
                    />
                  ) : (
                    <input
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={inputStyle}
                      autoFocus
                      onFocus={(e) => {
                        e.target.style.borderColor = '#26C6DA'
                        e.target.style.backgroundColor = '#FFFFFF'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#EEEEEE'
                        e.target.style.backgroundColor = '#F5F5F5'
                      }}
                    />
                  )}

                  {isRegisterMode && (
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '20px',
                      fontSize: '14px',
                      color: '#757575'
                    }}>
                      {timeLeft > 0 ? (
                        <>Код действует: {formatTime(timeLeft)}</>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#26C6DA',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          Отправить новый код
                        </button>
                      )}
                    </div>
                  )}

                  {errorMessage && (
                    <div style={{
                      padding: '12px 20px',
                      background: '#FFEBEE',
                      color: '#C62828',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (isRegisterMode ? verificationCode.length !== 4 : !password)}
                    style={buttonStyle(false, isLoading || (isRegisterMode ? verificationCode.length !== 4 : !password))}
                    onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    {isLoading ? (isRegisterMode ? 'Проверка...' : 'Вход...') : (isRegisterMode ? 'Verify' : 'Login')}
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#757575',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Назад
                  </button>
                </form>
              )}

              <p style={{
                textAlign: 'center',
                color: '#9E9E9E',
                fontSize: '14px',
                margin: '24px 0 20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                or use your account
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  f
                </div>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  G
                </div>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  in
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Left: Login Form */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            padding: '40px',
            transition: 'all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transform: isTransitioning ? 'translateX(100%) scale(1.05)' : 'translateX(0) scale(1)',
            opacity: isTransitioning ? 0 : 1,
            filter: isTransitioning ? 'blur(10px)' : 'blur(0)'
          }}>
            <div style={{
              maxWidth: '400px',
              width: '100%',
              opacity: isStepTransitioning ? 0 : 1,
              transform: isStepTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '40px',
                color: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                {currentStep === 1 ? 'Login here.' : 'Enter password.'}
              </h2>

              {/* Same form structure as register, just in login mode */}
              {currentStep === 1 ? (
                <form onSubmit={handlePhoneSubmit}>
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '20px',
                      top: '48%',
                      transform: 'translateY(-50%)',
                      fontSize: '15px',
                      color: '#757575',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      +7
                    </div>
                    <input
                      type="tel"
                      placeholder="777-123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      style={{ ...inputStyle, paddingLeft: '50px' }}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#26C6DA'
                        e.target.style.backgroundColor = '#FFFFFF'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#EEEEEE'
                        e.target.style.backgroundColor = '#F5F5F5'
                      }}
                    />
                  </div>

                  {errorMessage && (
                    <div style={{
                      padding: '12px 20px',
                      background: '#FFEBEE',
                      color: '#C62828',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || phone.replace(/\D/g, '').length !== 10}
                    style={buttonStyle(false, isLoading || phone.replace(/\D/g, '').length !== 10)}
                    onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    {isLoading ? 'Отправка...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin}>
                  <p style={{
                    fontSize: '14px',
                    color: '#757575',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    Введите пароль для +{getCleanPhone(phone)}
                  </p>

                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    autoFocus
                    onFocus={(e) => {
                      e.target.style.borderColor = '#26C6DA'
                      e.target.style.backgroundColor = '#FFFFFF'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#EEEEEE'
                      e.target.style.backgroundColor = '#F5F5F5'
                    }}
                  />

                  {errorMessage && (
                    <div style={{
                      padding: '12px 20px',
                      background: '#FFEBEE',
                      color: '#C62828',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !password}
                    style={buttonStyle(false, isLoading || !password)}
                    onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    {isLoading ? 'Вход...' : 'Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#757575',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Назад
                  </button>
                </form>
              )}

              <p style={{
                textAlign: 'center',
                color: '#9E9E9E',
                fontSize: '14px',
                margin: '24px 0 20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                or use your account
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  f
                </div>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  G
                </div>
                <div
                  style={socialButtonStyle}
                  onMouseEnter={(e) => e.target.style.borderColor = '#26C6DA'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#EEEEEE'}
                >
                  in
                </div>
              </div>
            </div>
          </div>

          {/* Right: Animated Background (Login mode) */}
          <div style={{
            flex: 1,
            transition: 'all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transform: isTransitioning ? 'translateX(-100%) scale(0.95)' : 'translateX(0) scale(1)',
            opacity: isTransitioning ? 0 : 1,
            filter: isTransitioning ? 'blur(10px)' : 'blur(0)'
          }}>
            <AnimatedWaterBackground>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '16px',
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.6s ease'
              }}>
                Start your<br />journey now
              </h1>
              <p style={{
                fontSize: '16px',
                opacity: 0.9,
                marginBottom: '40px',
                textAlign: 'center',
                maxWidth: '300px',
                lineHeight: '1.6'
              }}>
                If you don't have an account yet, join us and start your journey.
              </p>
              <button
                onClick={switchMode}
                style={buttonStyle(true)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.transform = 'scale(1)'
                }}
              >
                Register →
              </button>
            </AnimatedWaterBackground>
          </div>
        </>
      )
      }

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="flex: 1"] {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </div >
  )
}
