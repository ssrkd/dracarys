import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import './Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import cardImage from '../images/card.png'
import cardImage2 from '../images/card2.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'
import securityIcon from '../images/security.png'
import instantlyIcon from '../images/instantly.png'
import noLimitIcon from '../images/no-limit.png'
import user247Icon from '../images/user247.png'
import highCashbackIcon from '../images/high-cashback.png'
import walletCardIcon from '../images/wallet-card.png'

export default function Card() {
  usePageTitle('Бонусная карта')
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const cardImages = [cardImage, cardImage2]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Автоматическая смена карточек (останавливается при ручном взаимодействии)
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cardImages.length)
    }, 5000) // Меняем каждые 5 секунд

    return () => clearInterval(interval)
  }, [isAutoPlaying, cardImages.length])

  const handleManualCardChange = (newIndex) => {
    setCurrentCardIndex(newIndex)
    setIsAutoPlaying(false) // Останавливаем автопрокрутку

    // Возобновляем автопрокрутку через 10 секунд бездействия
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 10000)
  }

  const handlePrevCard = () => {
    const newIndex = (currentCardIndex - 1 + cardImages.length) % cardImages.length
    handleManualCardChange(newIndex)
  }

  const handleNextCard = () => {
    const newIndex = (currentCardIndex + 1) % cardImages.length
    handleManualCardChange(newIndex)
  }

  // Обработка свайпа для мобильных
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNextCard()
    }
    if (isRightSwipe) {
      handlePrevCard()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
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
          justifyContent: 'space-between',
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
            onClick={() => navigate('/')}
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              className="home-header-button-login"
              style={{
                padding: '10px 22px',
                background: 'transparent',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                letterSpacing: '-0.3px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.06)'
                e.target.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.transform = 'scale(1)'
              }}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/login?mode=register')}
              className="home-header-button-register"
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                letterSpacing: '-0.3px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)'
                e.target.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.25)'
              }}
            >
              Регистрация
            </button>

            {/* Мобильное меню - три полоски */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="home-mobile-menu-button"
              style={{
                display: 'none',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              <span style={{
                width: '24px',
                height: '2px',
                background: '#000000',
                borderRadius: '2px',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
              }}></span>
              <span style={{
                width: '24px',
                height: '2px',
                background: '#000000',
                borderRadius: '2px',
                transition: 'all 0.3s',
                opacity: mobileMenuOpen ? 0 : 1
              }}></span>
              <span style={{
                width: '24px',
                height: '2px',
                background: '#000000',
                borderRadius: '2px',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
              }}></span>
            </button>
          </div>
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

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="home-hero-section" style={{
        paddingTop: '100px',
        paddingBottom: '100px',
        background: '#FFFFFF'
      }}>
        <div className="home-hero-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '80px',
          alignItems: 'center'
        }}>
          <div className="card-hero-text-wrapper">
            <h1 className="home-hero-title card-hero-title" style={{
              fontSize: '80px',
              fontWeight: '600',
              lineHeight: '1',
              marginBottom: '40px',
              color: '#000000',
              letterSpacing: '-3px'
            }}>
              Бонусная карта от qaraa — место, где бонусы работают на вас
            </h1>

            <button
              onClick={() => navigate('/login')}
              className="home-hero-button card-hero-button"
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                letterSpacing: '-0.3px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                marginBottom: '80px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)'
                e.target.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.25)'
              }}
            >
              Получить карту
            </button>

            <div className="home-stats-grid card-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '40px',
              paddingTop: '40px',
              borderTop: '1px solid #E5E5E5'
            }}>
              {[
                { number: '5%', label: 'кэшбэк' },
                { number: '5K+', label: 'довольных клиентов' },
                { number: '24/7', label: 'поддержка' },
                { number: '∞', label: 'абсолютно бесплатно' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="home-stat-number" style={{
                    fontSize: '48px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '8px',
                    letterSpacing: '-1.5px'
                  }}>
                    {stat.number}
                  </div>
                  <div className="home-stat-label" style={{
                    fontSize: '15px',
                    color: '#999999',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="home-card-container card-hero-image"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0, 0, 0, 0.12)'
            }}>
            <img
              src={cardImages[currentCardIndex]}
              className="home-card-image"
              alt="qaraa card"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                transition: 'opacity 0.5s ease'
              }}
            />

            <div className="home-card-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Card Number - справа и сверху */}
              <div className="home-card-number" style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#000000',
                letterSpacing: '2px',
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: '10px',
                marginTop: '-10px'
              }}>
                4000 •••• •••• 1234
              </div>

              {/* Бонусы - слева внизу */}
              <div className="home-card-bonus-container" style={{
                paddingLeft: '10px',
                marginBottom: '-18px'
              }}>
                <div className="home-card-bonus-label" style={{
                  fontSize: '12px',
                  color: '#000000',
                  opacity: 0.7,
                  marginBottom: '4px'
                }}>
                  Бонусы
                </div>
                <div className="home-card-bonus-value" style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#000000'
                }}>
                  5,000 ₸
                </div>
              </div>
            </div>

            {/* Кнопки навигации - скрыты на мобильных */}
            <button
              onClick={handlePrevCard}
              className="home-card-nav-btn home-card-nav-prev"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#000000',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.8)'}
            >
              ‹
            </button>
            <button
              onClick={handleNextCard}
              className="home-card-nav-btn home-card-nav-next"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#000000',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.8)'}
            >
              ›
            </button>

            {/* Индикаторы */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {cardImages.map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleManualCardChange(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentCardIndex === index ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats-section" style={{
        padding: '120px 0',
        background: '#F8F8F8',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div className="home-stats-section-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <h2 className="home-stats-section-title" style={{
            fontSize: '64px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '80px',
            color: '#000000',
            letterSpacing: '-2px',
            maxWidth: '800px'
          }}>
            Гости накапливают бонусы и экономят на каждой покупке
          </h2>

          <div className="home-steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px'
          }}>
            {[
              {
                number: '01',
                title: 'Получайте карту',
                description: 'Зарегистрируйтесь за 30 секунд и получите цифровую карту qaraa прямо в телефон'
              },
              {
                number: '02',
                title: 'Копите бонусы',
                description: 'Получайте 5% бонусами с каждой покупки без ограничений и лимитов'
              },
              {
                number: '03',
                title: 'Тратьте бонусы',
                description: 'Оплачивайте бонусами до 100% следующих заказов когда захотите'
              }
            ].map((item, i) => (
              <div key={i} className={`home-step-card ${item.title === 'Тратьте бонусы' ? 'card-last-step' : ''}`} style={{
                background: '#FFFFFF',
                padding: '48px',
                borderRadius: '16px'
              }}>
                <div className="home-step-number" style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#999999',
                  marginBottom: '24px',
                  letterSpacing: '1px'
                }}>
                  {item.number}
                </div>
                <h3 className="home-step-title" style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '16px',
                  letterSpacing: '-0.5px'
                }}>
                  {item.title}
                </h3>
                <p className="home-step-description" style={{
                  fontSize: '17px',
                  color: '#666666',
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="home-benefits-section" style={{
        padding: '120px 0',
        background: '#FFFFFF',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div className="home-benefits-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <h2 className="home-benefits-title" style={{
            fontSize: '64px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '80px',
            color: '#000000',
            letterSpacing: '-2px',
            maxWidth: '800px'
          }}>
            Почему выбирают бонусную карту от qaraa?
          </h2>

          <div className="home-benefits-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '48px'
          }}>
            {[
              {
                icon: highCashbackIcon,
                title: 'Высокий кэшбэк',
                description: 'Получайте 5% бонусами с каждой покупки. Без сложных условий и ограничений по сумме.'
              },
              {
                icon: instantlyIcon,
                title: 'Мгновенно',
                description: 'Бонусы начисляются сразу после оплаты покупки и доступны к использованию.'
              },
              {
                icon: walletCardIcon,
                title: 'Всегда с собой',
                description: 'Карта в телефоне — больше не нужны пластиковые карты. Добавьте в Apple Wallet.'
              },
              {
                icon: securityIcon,
                title: 'Безопасность',
                description: 'Ваши данные защищены современным шифрованием. Мы не передаём информацию третьим лицам.'
              },
              {
                icon: noLimitIcon,
                title: 'Без лимитов',
                description: 'Копите и тратьте бонусы как хотите. Нет минимальных сумм и ограничений по времени.'
              },
              {
                icon: user247Icon,
                title: 'Поддержка 24/7',
                description: 'Наша команда всегда готова помочь. Ответим на любые вопросы в любое время.'
              }
            ].map((item, i) => (
              <div key={i} className="home-benefit-item" style={{
                padding: '48px',
                borderTop: '1px solid #E5E5E5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      flexShrink: 0
                    }}
                  />
                  <h3 className="home-benefit-title" style={{
                    fontSize: '32px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '0',
                    letterSpacing: '-0.5px'
                  }}>
                    {item.title}
                  </h3>
                </div>
                <p className="home-benefit-description" style={{
                  fontSize: '18px',
                  color: '#666666',
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '80px 24px 50px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        color: '#1C1C1E',
        position: 'relative',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '50px',
            marginBottom: '50px'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '800',
                marginBottom: '16px',
                color: '#1C1C1E',
                letterSpacing: '-0.5px'
              }}>qaraa.kz</div>
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <img
                  src={qaraaCrmLogo}
                  alt="qaraa × qaraa.crm"
                  style={{
                    height: '100px',
                    width: 'auto'
                  }}
                />
              </div>
              <div style={{ fontSize: '15px', color: '#636366', fontWeight: '500' }}>Безопасная экосистема</div>
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#8E8E93',
                marginBottom: '20px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>Навигация</div>
              {[{ name: 'О нас', path: '/about-us' }, { name: 'Бонусная карта', path: '/card-info' }].map(l => (
                <div key={l.path} onClick={() => navigate(l.path)} style={{
                  fontSize: '15px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  color: '#1C1C1E',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#5856D6'
                    e.currentTarget.style.paddingLeft = '8px'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1C1C1E'
                    e.currentTarget.style.paddingLeft = '0'
                  }}>
                  {l.name}
                </div>
              ))}
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#8E8E93',
                marginBottom: '20px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>Социальные сети</div>
              {[
                { name: 'Instagram', url: 'https://www.instagram.com/qaraa.kz?igsh=cWw3cmlsNmJ0ZHRi' },
                { name: 'TikTok', url: 'https://www.tiktok.com/@qaraa.kz?_r=1&_t=ZM-91EaJ8tj6Do' },
                { name: 'Telegram', url: 'https://t.me/qaraa_kz' },
                { name: 'WhatsApp', url: 'https://wa.me/77778307588' }
              ].map(s => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block',
                  fontSize: '15px',
                  color: '#1C1C1E',
                  fontWeight: '500',
                  textDecoration: 'none',
                  marginBottom: '12px',
                  transition: 'all 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#5856D6'
                    e.currentTarget.style.paddingLeft = '8px'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1C1C1E'
                    e.currentTarget.style.paddingLeft = '0'
                  }}>
                  {s.name}
                </a>
              ))}
            </div>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#8E8E93',
                marginBottom: '20px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>Информация</div>
              <div style={{ fontSize: '15px', marginBottom: '12px', color: '#1C1C1E', fontWeight: '500' }}>+7 777 830 75 88</div>
              <div style={{ fontSize: '15px', color: '#636366', fontWeight: '500' }}>Астана, Казахстан</div>
              <div style={{ fontSize: '15px', marginTop: '12px', color: '#636366', fontWeight: '500' }}>Жошы Хана 13</div>
            </div>
          </div>
          <div style={{
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
            <div>© 2026 qaraa.kz | Все права защищены.</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span onClick={() => navigate('/privacy')} style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#5856D6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8E8E93'
                }}>
                Политика конфиденциальности
              </span>
              <span onClick={() => navigate('/terms')} style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#5856D6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8E8E93'
                }}>
                Пользовательское соглашение
              </span>
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile Styles for header buttons/hamburger */}
      <style>{`
        @media (max-width: 768px) {
          .home-mobile-menu-button {
            display: flex !important;
            flex-direction: column !important;
            gap: 5px !important;
          }
          .home-header-button-login,
          .home-header-button-register { display: none !important; }
          
          /* Скрываем стрелки навигации на мобильных */
          .home-card-nav-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}