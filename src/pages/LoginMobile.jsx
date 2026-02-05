import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import bcrypt from 'bcryptjs'
import './Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'

export default function LoginNew({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isRegisterMode = searchParams.get('mode') === 'register'

  // States
  const [currentStep, setCurrentStep] = useState(1) // 1: phone, 1.5: password (login), 2: verification code, 3: registration
  const [phone, setPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('') // Пароль для входа
  const [verificationCode, setVerificationCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 минут = 300 секунд
  const [existingCustomer, setExistingCustomer] = useState(null) // Сохраняем данные пользователя
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    city: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loginNotice, setLoginNotice] = useState('')
  const [dateError, setDateError] = useState('') // Отдельная ошибка для даты
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotStep, setForgotStep] = useState(1) // 1: ввод телефона, 2: инструкция
  const [forgotCode, setForgotCode] = useState('')
  const [forgotVerified, setForgotVerified] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotNewPass, setForgotNewPass] = useState('')
  const [forgotNewPass2, setForgotNewPass2] = useState('')

  const WHATSAPP_NUMBER = '77768883007' // Номер для WhatsApp бота

  const closeForgotModal = () => {
    setForgotOpen(false)
    setForgotStep(1)
    setForgotPhone('')
    setForgotCode('')
    setForgotVerified(false)
    setForgotError('')
    setForgotNewPass('')
    setForgotNewPass2('')
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isRegisterMode) {
      setCurrentStep(1)
    }
  }, [isRegisterMode])

  // При изменении шага — прокрутить страницу к началу (моб. версия)
  useEffect(() => {
    // Прокручиваем к началу при любом изменении шага
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (_) {
        window.scrollTo(0, 0)
      }
    }

    scrollToTop()

    // Дополнительные попытки для мобильных устройств
    setTimeout(() => window.scrollTo(0, 0), 100)
    setTimeout(() => window.scrollTo(0, 0), 300)
    setTimeout(() => window.scrollTo(0, 0), 500)
  }, [currentStep])

  // Таймер обратного отсчета для кода
  useEffect(() => {
    if (currentStep === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
    if (timeLeft === 0) {
      setErrorMessage('Время действия кода истекло. Запросите новый код.')
    }
  }, [currentStep, timeLeft])

  // Автоматическое скрытие ошибок через 2 секунды для кода верификации
  useEffect(() => {
    if (errorMessage && currentStep === 2) {
      const timer = setTimeout(() => {
        setErrorMessage('')
        setVerificationCode('') // Очищаем поле кода
      }, 2000)
      return () => clearTimeout(timer)
    } else if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, currentStep])

  useEffect(() => {
    if (dateError) {
      const timer = setTimeout(() => {
        setDateError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [dateError])

  // Обработка скрытия клавиатуры на мобильных устройствах
  useEffect(() => {
    const handleViewportChange = () => {
      // Принудительная прокрутка к началу страницы при изменении viewport
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 300)
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 500)
    }

    const handleResize = () => {
      // Если высота окна увеличилась (клавиатура скрылась), прокручиваем к началу
      handleViewportChange()
    }

    const handleFocusOut = () => {
      // При потере фокуса с input полей, прокручиваем к началу
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }

    // Добавляем обработчики событий
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleViewportChange)

    // Добавляем обработчики для всех input полей
    const inputs = document.querySelectorAll('input')
    inputs.forEach(input => {
      input.addEventListener('blur', handleFocusOut)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleViewportChange)
      inputs.forEach(input => {
        input.removeEventListener('blur', handleFocusOut)
      })
    }
  }, [currentStep]) // Перезапускаем при изменении шага

  // Phone formatting: +7 XXX-(XXX)-XX-XX
  const formatPhoneNumber = (value) => {
    // Извлекаем только цифры
    let digits = value.replace(/\D/g, '')

    // Если ничего не введено, возвращаем пустую строку
    if (digits.length === 0) return ''

    // Всегда первая цифра должна быть 7 (казахстанские номера)
    // Если пользователь ввел не 7, заменяем первую цифру на 7
    if (digits.charAt(0) !== '7') {
      digits = '7' + digits.substring(1)
    }

    // Ограничиваем до 10 цифр (после +7)
    digits = digits.slice(0, 10)

    // Форматируем в зависимости от количества цифр
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return digits.slice(0, 3) + '-(' + digits.slice(3)
    if (digits.length <= 8) return digits.slice(0, 3) + '-(' + digits.slice(3, 6) + ')-' + digits.slice(6)
    return digits.slice(0, 3) + '-(' + digits.slice(3, 6) + ')-' + digits.slice(6, 8) + '-' + digits.slice(8, 10)
  }

  // Get clean phone number (11 digits with country code 7) for database
  const getCleanPhone = (formattedPhone) => {
    const digits = formattedPhone.replace(/\D/g, '')
    // Всегда добавляем префикс 7 (для Казахстана) к введенным цифрам
    // Пользователь вводит 10 цифр, в базу уходит +7 + эти 10 цифр = 11 цифр
    return '7' + digits
  }

  // Авто-проверка кода для восстановления (модалка)
  useEffect(() => {
    const verifyForgotCode = async () => {
      if (forgotStep !== 2) return
      if (forgotCode.length !== 4) return
      setForgotError('')
      try {
        const cleanPhone = getCleanPhone(forgotPhone)
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', cleanPhone)
          .eq('verification_code', forgotCode)
          .eq('code_used', false)
          .gt('code_expires_at', new Date().toISOString())
          .maybeSingle()

        if (error) throw error
        if (!customer) {
          setForgotError('❌ Неверный код или истек срок действия')
          return
        }
        setForgotVerified(true)
        setForgotStep(3)
      } catch (e) {
        setForgotError('Ошибка проверки кода. Попробуйте позже.')
      }
    }
    verifyForgotCode()
  }, [forgotCode, forgotStep])

  const submitNewPassword = async () => {
    setForgotError('')
    if (!forgotVerified) {
      setForgotError('Сначала подтвердите код')
      return
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('Пароль должен быть не менее 6 символов')
      return
    }
    if (forgotNewPass !== forgotNewPass2) {
      setForgotError('Пароли не совпадают')
      return
    }
    try {
      const cleanPhone = getCleanPhone(forgotPhone)
      const resp = await fetch('http://localhost:43123/api/reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: forgotCode, newPassword: forgotNewPass })
      })
      const result = await resp.json()
      if (!resp.ok || !result.success) {
        setForgotError(result.message || 'Не удалось сбросить пароль')
        return
      }
      // Успешно — закрываем модалку и переводим на вход по паролю
      setForgotOpen(false)
      setForgotPhone('')
      setForgotCode('')
      setForgotVerified(false)
      setForgotNewPass('')
      setForgotNewPass2('')
      setForgotStep(1)
      // Возврат к шагу логина паролем, если номер совпадает
      if (existingCustomer && existingCustomer.phone === cleanPhone) {
        setCurrentStep(1.5)
      }
      setLoginNotice('Пароль успешно обновлен. Введите новый пароль для входа.')
    } catch (e) {
      setForgotError('Техническая ошибка. Попробуйте позже.')
    }
  }

  // Name formatting
  const formatName = (value) => {
    const letters = value.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
    if (letters.length === 0) return ''
    return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase()
  }

  // Date formatting and validation
  const formatDate = (value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return digits.slice(0, 2) + '.' + digits.slice(2)
    return digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8)
  }

  // Validate date in real time
  const validateDate = (dateStr) => {
    if (!dateStr || dateStr.replace(/\D/g, '').length !== 8) {
      return { valid: false, error: '' }
    }

    const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    if (!match) {
      return { valid: false, error: 'Неверный формат даты' }
    }

    const [, day, month, year] = match
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)

    if (dayNum < 1 || dayNum > 31) {
      return { valid: false, error: 'Неверный день (от 1 до 31)' }
    }

    if (monthNum < 1 || monthNum > 12) {
      return { valid: false, error: 'Неверный месяц (от 1 до 12)' }
    }

    if (yearNum < 1960) {
      return { valid: false, error: 'Минимум год рождения: 1960' }
    }

    const today = new Date()
    const inputDate = new Date(yearNum, monthNum - 1, dayNum)

    if (inputDate > today) {
      return { valid: false, error: 'Дата не может быть в будущем' }
    }

    // Check if date is valid (e.g., not 31.02.2000)
    if (inputDate.getDate() !== dayNum || inputDate.getMonth() !== monthNum - 1 || inputDate.getFullYear() !== yearNum) {
      return { valid: false, error: 'Неверная дата рождения' }
    }

    return { valid: true, error: '' }
  }

  const cities = [
    'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз', 'Павлодар',
    'Усть-Каменогорск', 'Семей', 'Атырау', 'Костанай', 'Кызылорда', 'Уральск',
    'Петропавловск', 'Актау', 'Темиртау', 'Туркестан', 'Кокшетау', 'Талдыкорган',
    'Экибастуз', 'Рудный', 'Жанаозен', 'Балхаш', 'Сатпаев', 'Жезказган',
    'Кентау', 'Капшагай', 'Степногорск', 'Аксай', 'Атбасар'
  ]


  // Prefetch logic
  const prefetchRef = React.useRef(null)

  useEffect(() => {
    const clean = phone.replace(/\D/g, '')
    // Начинаем префетч когда введено достаточно цифр (например 10 для КЗ номера без 7ки или 11 с 7кой)
    if (clean.length >= 10) {
      const dbPhone = clean.length === 10 ? '7' + clean : clean
      // Если уже есть префетч на этот номер - не дублируем
      if (prefetchRef.current?.phone === dbPhone) return

      const promise = supabase
        .from('customers')
        .select('*')
        .eq('phone', dbPhone)
        .maybeSingle()

      prefetchRef.current = { phone: dbPhone, promise }
    }
  }, [phone])

  // Step 1: Phone verification
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    // Прокручиваем к началу страницы при отправке формы
    window.scrollTo(0, 0)
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    const cleanPhone = getCleanPhone(phone)
    const phoneDigits = cleanPhone.replace(/\D/g, '')

    // Проверяем что есть 11 цифр (7 + 10)
    if (phoneDigits.length < 11) {
      setErrorMessage('Введите корректный номер телефона (10 цифр)')
      return
    }

    setIsLoading(true)

    try {
      let customer, error

      // Используем префетч, если есть
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
        // Существующий пользователь
        if (isRegisterMode) {
          // Режим регистрации - номер уже существует
          setErrorMessage('Этот номер уже зарегистрирован. Войдите в аккаунт.')
        } else {
          // Режим входа - показываем форму пароля
          setExistingCustomer(customer)
          setCurrentStep(1.5) // Шаг ввода пароля
        }
      } else {
        // Новый пользователь
        if (isRegisterMode) {
          // Регистрация
          try {
            console.log('🔗 [Mobile] Отправка запроса на код для:', cleanPhone);
            const response = await fetch('http://localhost:43123/api/send-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: cleanPhone })
            });
            const data = await response.json();
            console.log('📩 [Mobile] Ответ от сервера бота:', data);

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

          setCurrentStep(2)
          setTimeLeft(300)
        } else {
          setErrorMessage('Аккаунт не найден. Пожалуйста, зарегистрируйтесь.')
        }
      }
    } catch (err) {
      setErrorMessage('Ошибка: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Prefetch fresh customer data when password step becomes active
  const passwordRefreshRef = React.useRef(null)

  useEffect(() => {
    if (currentStep === 1.5 && existingCustomer?.phone) {
      const promise = supabase
        .from('customers')
        .select('*')
        .eq('phone', existingCustomer.phone)
        .maybeSingle()
      passwordRefreshRef.current = promise
    }
  }, [currentStep, existingCustomer])

  // Step 1.5: Проверка пароля при входе
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoginNotice('')

    // Прокручиваем к началу страницы при отправке формы с паролем
    window.scrollTo(0, 0)
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    if (!loginPassword) {
      setErrorMessage('Введите пароль')
      return
    }

    setIsLoading(true)

    try {
      // Получаем актуальные данные пользователя из БД перед сравнением
      // Используем префетч, если он уже запущен
      let freshCustomer, fetchErr

      if (passwordRefreshRef.current) {
        const res = await passwordRefreshRef.current
        freshCustomer = res.data
        fetchErr = res.error
      } else {
        const res = await supabase
          .from('customers')
          .select('*')
          .eq('phone', existingCustomer.phone)
          .maybeSingle()
        freshCustomer = res.data
        fetchErr = res.error
      }

      if (fetchErr || !freshCustomer) {
        setErrorMessage('Ошибка входа: не удалось получить профиль')
        return
      }

      if (freshCustomer.is_banned) {
        setErrorMessage('Ваш аккаунт заблокирован администратором')
        return
      }

      // Проверяем пароль с помощью bcrypt против актуального хэша
      const isPasswordCorrect = await bcrypt.compare(loginPassword, freshCustomer.password)

      if (isPasswordCorrect) {
        // Прокручиваем к началу страницы перед переходом в dashboard
        // Для мобильных устройств делаем это с задержкой и несколько раз
        const scrollToTop = () => {
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } catch (_) {
            window.scrollTo(0, 0)
          }
        }

        // Немедленная прокрутка
        scrollToTop()

        // Дополнительная прокрутка через небольшие интервалы для мобильных
        setTimeout(scrollToTop, 50)
        setTimeout(scrollToTop, 100)
        setTimeout(() => {
          window.scrollTo(0, 0) // Принудительная прокрутка без анимации
        }, 150)

        // Дополнительная прокрутка после рендера Dashboard
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 300)
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 500)

        onLogin(freshCustomer)
      } else {
        setErrorMessage('Неверный пароль')
        setLoginPassword('')
      }
    } catch (err) {
      setErrorMessage('Ошибка входа: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Проверка кода верификации из базы
  const handleCodeVerification = async (codeToVerify = null) => {
    const code = codeToVerify || verificationCode

    if (!code || code.length !== 4) return

    setErrorMessage('')
    setIsLoading(true)

    try {
      const cleanPhone = getCleanPhone(phone)

      // Проверяем код в таблице customers
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('verification_code', code)
        .eq('code_used', false)
        .gt('code_expires_at', new Date().toISOString())
        .maybeSingle()

      if (customerError) throw customerError

      if (!customer) {
        setErrorMessage('❌ Неверный код или истек срок действия')
        return
      }

      // Помечаем код как использованный
      await supabase
        .from('customers')
        .update({ code_used: true })
        .eq('phone', cleanPhone)

      // Проверяем зарегистрирован ли пользователь (есть ли password)
      if (customer.password) {
        // Существующий пользователь - логиним
        // Прокручиваем к началу страницы перед переходом в dashboard
        const scrollToTop = () => {
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } catch (_) {
            window.scrollTo(0, 0)
          }
        }

        // Немедленная прокрутка
        scrollToTop()

        // Дополнительная прокрутка через небольшие интервалы для мобильных
        setTimeout(scrollToTop, 50)
        setTimeout(scrollToTop, 100)
        setTimeout(() => {
          window.scrollTo(0, 0) // Принудительная прокрутка без анимации
        }, 150)

        // Дополнительная прокрутка после рендера Dashboard
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 300)
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 500)

        onLogin(customer)
      } else {
        // Новый пользователь - переходим к регистрации
        setCurrentStep(3)
      }
    } catch (err) {
      setErrorMessage('❌ Ошибка: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  // Автоматическая проверка кода при вводе 4 цифр
  useEffect(() => {
    if (verificationCode.length === 4 && currentStep === 2) {
      handleCodeVerification(verificationCode)
    }
  }, [verificationCode, currentStep])

  // Повторная отправка кода
  const handleResendCode = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setVerificationCode('')

    try {
      const cleanPhone = getCleanPhone(phone)

      const response = await fetch('http://localhost:43123/api/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const result = await response.json()
      console.log('📩 [Mobile] Ответ от сервера бота (resend):', result);

      if (result.success) {
        // Код успешно отправлен
        setTimeLeft(300) // Сбрасываем таймер
        setErrorMessage('✅ Новый код отправлен в WhatsApp!')
      } else {
        setErrorMessage(result.message || 'Ошибка при отправке кода')
      }
    } catch (err) {
      console.error('Ошибка отправки кода:', err)
      setErrorMessage('💬 Откройте WhatsApp бота и отправьте любое сообщение еще раз для получения нового кода')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Registration
  const handleRegistration = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    // Validation
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      setErrorMessage('Имя должно содержать минимум 2 буквы')
      return
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      setErrorMessage('Фамилия должна содержать минимум 2 буквы')
      return
    }

    // Validate date
    const dateValidation = validateDate(formData.birthDate)
    if (!dateValidation.valid) {
      setErrorMessage(dateValidation.error || 'Неверная дата рождения')
      return
    }

    if (!formData.gender) {
      setErrorMessage('Выберите пол')
      return
    }

    if (!formData.city) {
      setErrorMessage('Выберите город')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов')
      return
    }

    setIsLoading(true)

    try {
      const fullname = `${formData.firstName.trim()} ${formData.lastName.trim()}`
      const cleanPhone = getCleanPhone(phone)

      // Хэшируем пароль перед сохранением
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      // Обновляем существующую запись в customers (она уже создана при верификации)
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .update({
          fullname,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          birth_date: formData.birthDate,
          gender: formData.gender,
          city: formData.city,
          password: hashedPassword
        })
        .eq('phone', cleanPhone)
        .select()
        .single()

      if (error) throw error

      // Прокручиваем к началу страницы перед переходом в dashboard
      const scrollToTop = () => {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (_) {
          window.scrollTo(0, 0)
        }
      }

      // Немедленная прокрутка
      scrollToTop()

      // Дополнительная прокрутка через небольшие интервалы для мобильных
      setTimeout(scrollToTop, 50)
      setTimeout(scrollToTop, 100)
      setTimeout(() => {
        window.scrollTo(0, 0) // Принудительная прокрутка без анимации
      }, 150)

      // Дополнительная прокрутка после рендера Dashboard
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 300)
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 500)

      onLogin(newCustomer)
    } catch (err) {
      setErrorMessage('Ошибка регистрации: ' + (err.message || 'Попробуйте позже'))
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Переключение между логином и регистрацией
  const toggleMode = () => {
    if (isRegisterMode) {
      navigate('/login')
    } else {
      navigate('/login?mode=register')
    }
    setPhone('')
    setErrorMessage('')
    setDateError('')
    setCurrentStep(1)
  }

  // iOS стили для полей ввода
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '17px',
    border: '1px solid #d1d1d6',
    borderRadius: '12px',
    transition: 'all 0.2s',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#000',
    background: '#fff',
    fontWeight: '400',
    outline: 'none'
  }

  // iOS стили для лейблов
  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#000',
    marginBottom: '8px'
  }

  // iOS стили для кнопок
  const buttonStyle = (isDisabled) => ({
    width: '100%',
    padding: '16px',
    background: isDisabled ? '#e5e5e7' : '#007AFF',
    color: isDisabled ? '#86868b' : '#fff',
    fontSize: '17px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Fixed Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        transition: 'all 0.3s ease'
      }}>
        <div className="home-header-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '20px 48px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <div className="home-logo-container" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',
            opacity: 1
          }}
            onClick={() => {
              // Прокручиваем к началу страницы перед навигацией
              window.scrollTo(0, 0)
              setTimeout(() => {
                window.scrollTo(0, 0)
              }, 50)
              navigate('/')
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <img
              src={logoQaraa}
              alt="qaraa"
              className="home-logo"
              style={{
                height: '42px',
                width: 'auto',
                transition: 'transform 0.3s ease'
              }}
            />
            <div>
              <div className="home-logo-title" style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#1C1C1E',
                lineHeight: '1'
              }}>
                qaraa.kz
              </div>
              <div className="home-logo-subtitle" style={{
                fontSize: '12px',
                color: '#8E8E93',
                marginTop: '4px'
              }}>
                Безопасная экосистема
              </div>
            </div>
          </div>
          {/* На странице логина кнопки/меню в хедере скрыты */}
        </div>
      </header>

      {/* Мобильное выпадающее меню */}
      {mobileMenuOpen && (
        <div
          className="home-mobile-menu"
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderBottom: 'none',
            padding: '16px 20px',
            zIndex: 99,
            display: 'none',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <button
            onClick={() => {
              navigate('/login')
              setMobileMenuOpen(false)
            }}
            style={{
              padding: '12px 20px',
              background: 'rgba(0, 0, 0, 0.06)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#000000',
              cursor: 'pointer',
              width: '100%',
              letterSpacing: '-0.3px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              transition: 'all 0.2s ease'
            }}
          >
            Войти
          </button>
          <button
            onClick={() => {
              navigate('/login?mode=register')
              setMobileMenuOpen(false)
            }}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: 'pointer',
              width: '100%',
              letterSpacing: '-0.3px',
              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              transition: 'all 0.2s ease'
            }}
          >
            Регистрация
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '100px 16px 80px',
        overflowY: 'visible',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fff',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Индикатор прогресса */}
          {isRegisterMode && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '32px'
            }}>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: currentStep >= step ? '#007AFF' : '#e5e5e7',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              ))}
            </div>
          )}
          {/* Title Section */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '700',
              color: '#000',
              letterSpacing: '-0.4px',
              marginBottom: '6px'
            }}>
              {currentStep === 1 && (isRegisterMode ? 'Регистрация' : 'Вход')}
              {currentStep === 2 && 'Подтверждение'}
              {currentStep === 3 && 'Завершение регистрации'}
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#86868b',
              fontWeight: '400'
            }}>
              {currentStep === 1 && (isRegisterMode
                ? 'Введите ваш номер телефона'
                : 'Войдите с номером телефона')}
              {currentStep === 2 && 'Введите код из Telegram'}
              {currentStep === 3 && 'Заполните данные о себе'}
            </p>
          </div>

          {/* Step 1: Phone */}
          {currentStep === 1 && (
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Номер телефона</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '17px',
                    color: '#000',
                    fontWeight: '400',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}>
                    +7
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="777-(830)-75-88"
                    style={{
                      ...inputStyle,
                      paddingLeft: '46px'
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{
                  padding: '16px 20px',
                  background: '#fff1f0',
                  color: '#cf1322',
                  borderRadius: '12px',
                  fontSize: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  animation: 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  lineHeight: '1.5',
                  border: '1px solid #ffccc7'
                }}>
                  {errorMessage}
                </div>
              )}

              {loginNotice && (
                <div style={{
                  padding: '16px 20px',
                  background: '#f0fff4',
                  color: '#1a7f37',
                  borderRadius: '12px',
                  fontSize: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #b7eb8f'
                }}>
                  {loginNotice}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || phone.replace(/\D/g, '').length !== 10}
                style={buttonStyle(isLoading || phone.replace(/\D/g, '').length !== 10)}
              >
                {isLoading ? 'Проверка...' : 'Продолжить'}
              </button>

              {/* Переключение режима */}
              <div style={{
                marginTop: '28px',
                textAlign: 'center',
                fontSize: '15px',
                color: '#86868b'
              }}>
                {isRegisterMode ? (
                  <>
                    У вас уже есть аккаунт?{' '}
                    <span
                      onClick={toggleMode}
                      style={{
                        color: '#007AFF',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      Войдите
                    </span>
                  </>
                ) : (
                  <>
                    Нет аккаунта?{' '}
                    <span
                      onClick={toggleMode}
                      style={{
                        color: '#007AFF',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      Зарегистрируйтесь
                    </span>
                  </>
                )}
              </div>
            </form>
          )}

          {/* Step 1.5: Password Login */}
          {currentStep === 1.5 && (
            <form onSubmit={handlePasswordLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Пароль</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Введите ваш пароль"
                  style={inputStyle}
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <div style={{
                  padding: '16px 20px',
                  background: '#fff1f0',
                  color: '#cf1322',
                  borderRadius: '12px',
                  fontSize: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  animation: 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  lineHeight: '1.5',
                  border: '1px solid #ffccc7'
                }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginPassword}
                style={buttonStyle(isLoading || !loginPassword)}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>

              {/* Кнопка назад */}
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1)
                  setLoginPassword('')
                  setExistingCustomer(null)
                  setErrorMessage('')
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: '#007AFF',
                  fontSize: '17px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none',
                  marginTop: '12px'
                }}
              >
                Изменить номер
              </button>

              {/* Forgot password */}
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span
                  onClick={() => {
                    setForgotOpen(true)
                    setForgotStep(1)
                    setForgotPhone('')
                    setForgotCode('')
                    setForgotVerified(false)
                    setForgotError('')
                    setForgotNewPass('')
                    setForgotNewPass2('')
                  }}
                  style={{ color: '#007AFF', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  Забыли пароль?
                </span>
              </div>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  padding: '20px',
                  background: '#f5f5f7',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  border: '1px solid #e5e5e7'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                    opacity: 0.9
                  }}>
                    💬
                  </div>
                  <p style={{
                    fontSize: '17px',
                    color: '#000',
                    marginBottom: '8px',
                    fontWeight: '600',
                    letterSpacing: '-0.3px'
                  }}>
                    Мы отправили вам на WhatsApp код подтверждения
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#86868b',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}>
                    Введите код подтверждения ниже
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '13px 24px',
                      background: '#007AFF',
                      color: '#fff',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    Открыть бота
                  </a>
                </div>

                <label style={labelStyle}>код подтверждения:</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setVerificationCode(value)
                  }}
                  placeholder="0000"
                  style={{
                    ...inputStyle,
                    fontSize: '32px',
                    textAlign: 'center',
                    letterSpacing: '12px',
                    fontWeight: '700'
                  }}
                  maxLength={4}
                  autoFocus
                  disabled={isLoading}
                />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#86868b' }}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                  {timeLeft === 0 ? (
                    <span
                      onClick={handleResendCode}
                      style={{
                        color: '#007AFF',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Отправить новый код
                    </span>
                  ) : (
                    <span style={{ color: '#86868b' }}>
                      Код действителен
                    </span>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div style={{
                  padding: '16px 20px',
                  background: '#fff1f0',
                  color: '#cf1322',
                  borderRadius: '12px',
                  fontSize: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  animation: 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  lineHeight: '1.5',
                  border: '1px solid #ffccc7'
                }}>
                  <style>{`
                    @keyframes slideInDown {
                      from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                      }
                    }
                  `}</style>
                  {errorMessage}
                </div>
              )}

              {/* Кнопка автоматически не нужна, код проверяется автоматически */}
              {isLoading && (
                <div style={{
                  textAlign: 'center',
                  padding: '16px',
                  color: '#86868b',
                  fontSize: '14px'
                }}>
                  Проверка кода...
                </div>
              )}

              <button
                type="button"
                onClick={handleResendCode}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: '#007AFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none',
                  marginTop: '12px'
                }}
              >
                Отправить код повторно
              </button>
            </div>
          )}

          {/* Step 3: Registration */}
          {currentStep === 3 && (
            <form onSubmit={handleRegistration}>
              {/* Имя и Фамилия */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Имя *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', formatName(e.target.value))}
                    placeholder="Имя"
                    style={inputStyle}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Фамилия *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', formatName(e.target.value))}
                    placeholder="Фамилия"
                    style={inputStyle}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Дата рождения */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Дата рождения *</label>
                {dateError && (
                  <div style={{
                    padding: '10px 14px',
                    background: '#fff1f0',
                    color: '#cf1322',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '8px',
                    border: '1px solid #ffccc7'
                  }}>
                    {dateError}
                  </div>
                )}
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) => {
                    const formatted = formatDate(e.target.value)
                    updateFormData('birthDate', formatted)
                    // Real-time validation для даты
                    if (formatted.replace(/\D/g, '').length === 8) {
                      const validation = validateDate(formatted)
                      if (!validation.valid) {
                        setDateError(validation.error)
                      } else {
                        setDateError('')
                      }
                    } else if (formatted.replace(/\D/g, '').length > 0) {
                      setDateError('')
                    }
                  }}
                  placeholder="01.01.2001"
                  style={inputStyle}
                  disabled={isLoading}
                  maxLength={10}
                />
              </div>

              {/* Пол */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Пол *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => updateFormData('gender', 'male')}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: formData.gender === 'male' ? '#007AFF' : '#f5f5f7',
                      color: formData.gender === 'male' ? '#fff' : '#000',
                      fontSize: '17px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: 'none'
                    }}
                  >
                    Мужской
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('gender', 'female')}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: formData.gender === 'female' ? '#007AFF' : '#f5f5f7',
                      color: formData.gender === 'female' ? '#fff' : '#000',
                      fontSize: '17px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: 'none'
                    }}
                  >
                    Женский
                  </button>
                </div>
              </div>

              {/* Город */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Город *</label>
                <select
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  style={{
                    ...inputStyle,
                    color: formData.city ? '#000' : '#86868b',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    paddingRight: '40px'
                  }}
                  disabled={isLoading}
                >
                  <option value="" disabled>Выберите город</option>
                  {cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Пароль */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Пароль *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Минимум 6 символов"
                  style={inputStyle}
                  disabled={isLoading}
                />
              </div>

              {/* Общая ошибка */}
              {errorMessage && (
                <div style={{
                  padding: '16px 20px',
                  background: '#fff1f0',
                  color: '#cf1322',
                  borderRadius: '12px',
                  fontSize: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  animation: 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  lineHeight: '1.5',
                  border: '1px solid #ffccc7'
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1)
                    setFormData({
                      firstName: '',
                      lastName: '',
                      birthDate: '',
                      gender: '',
                      city: '',
                      password: ''
                    })
                    setErrorMessage('')
                    setDateError('')
                  }}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: '#f5f5f7',
                    color: '#000',
                    fontSize: '17px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: 'none'
                  }}
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.firstName.trim() || !formData.lastName.trim() ||
                    !formData.birthDate || !formData.gender || !formData.city || !formData.password}
                  style={{
                    flex: 2,
                    ...buttonStyle(isLoading || !formData.firstName.trim() || !formData.lastName.trim() ||
                      !formData.birthDate || !formData.gender || !formData.city || !formData.password)
                  }}
                >
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#86868b',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            Продолжая, вы соглашаетесь с{' '}
            <span
              onClick={() => navigate('/terms')}
              style={{
                color: '#007AFF',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              условиями
            </span>
            {' '}и{' '}
            <span
              onClick={() => navigate('/privacy')}
              style={{
                color: '#007AFF',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              политикой конфиденциальности
            </span>
          </div>

          {/* Service info */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            color: '#A1A1A6',
            fontSize: '12px',
            lineHeight: '1.3'
          }}>
            <div>Последнее обновление: 05.01.2026</div>
            <div style={{ marginTop: '6px' }}>version 1.7.5</div>
            <div style={{ marginTop: '6px' }}>
              тех.поддержка — <span style={{ color: '#007AFF', fontWeight: '600' }}>@sssssrkd</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200 }} onClick={closeForgotModal}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            {forgotStep === 1 && (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Я забыл пароль</h3>
                <p style={{ fontSize: 14, color: '#86868b', marginBottom: 16 }}>Не волнуйтесь, такое случается.</p>

                <label style={labelStyle}>Номер телефона</label>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: '#000', fontWeight: 400, zIndex: 1, pointerEvents: 'none' }}>+7</div>
                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => {
                      setForgotPhone(formatPhoneNumber(e.target.value))
                      setForgotCode('')
                      setForgotVerified(false)
                      setForgotError('')
                    }}
                    placeholder="777-(830)-75-88"
                    style={{ ...inputStyle, paddingLeft: 46 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => { setForgotStep(2); setForgotCode(''); setForgotError('') }}
                  style={buttonStyle(forgotPhone.replace(/\D/g, '').length !== 10)}
                  disabled={forgotPhone.replace(/\D/g, '').length !== 10}
                >
                  Продолжить
                </button>

                <button
                  type="button"
                  onClick={() => closeForgotModal()}
                  style={{
                    width: '100%', padding: 14, background: 'transparent', color: '#007AFF', fontSize: 17, fontWeight: 600, borderRadius: 12, cursor: 'pointer', border: 'none', marginTop: 10
                  }}
                >
                  Отмена
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>🔐</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Сброс пароля через WhatsApp</h3>
                <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.5, marginBottom: 20 }}>
                  Чтобы сбросить пароль, откройте WhatsApp и отправьте любое сообщение боту.
                  Вы получите одноразовый 4-значный код, действительный 5 минут.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '13px 24px',
                    background: '#007AFF',
                    color: '#fff',
                    borderRadius: 12,
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  Открыть бота
                </a>

                <div style={{ marginTop: 20 }}>
                  <label style={labelStyle}>Код из Telegram (4 цифры)</label>
                  <input
                    type="tel"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    placeholder="Например, 1234"
                    style={inputStyle}
                  />
                  {forgotError && (
                    <div style={{ marginTop: 10, color: '#cf1322', fontSize: 13, fontWeight: 600 }}>{forgotError}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeForgotModal}
                  style={{
                    width: '100%', padding: 14, background: 'transparent', color: '#007AFF', fontSize: 17, fontWeight: 600, borderRadius: 12, cursor: 'pointer', border: 'none', marginTop: 12
                  }}
                >
                  Закрыть
                </button>
              </div>
            )}
            {forgotStep === 3 && (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Придумайте новый пароль</h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Новый пароль</label>
                  <input
                    type="password"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Минимум 6 символов"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Подтвердите новый пароль</label>
                  <input
                    type="password"
                    value={forgotNewPass2}
                    onChange={(e) => setForgotNewPass2(e.target.value)}
                    placeholder="Повторите пароль"
                    style={inputStyle}
                  />
                </div>
                {forgotError && (
                  <div style={{ marginBottom: 10, color: '#cf1322', fontSize: 13, fontWeight: 600 }}>{forgotError}</div>
                )}
                <button
                  type="button"
                  onClick={submitNewPassword}
                  style={buttonStyle(!(forgotNewPass && forgotNewPass.length >= 6 && forgotNewPass2))}
                  disabled={!(forgotNewPass && forgotNewPass.length >= 6 && forgotNewPass2)}
                >
                  Сохранить новый пароль
                </button>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  style={{
                    width: '100%', padding: 14, background: 'transparent', color: '#007AFF', fontSize: 17, fontWeight: 600, borderRadius: 12, cursor: 'pointer', border: 'none', marginTop: 12
                  }}
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          header { padding: 12px 16px !important; }
        }
      `}</style>
    </div>
  )
}