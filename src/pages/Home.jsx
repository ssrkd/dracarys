import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import humanImage from '../images/human.png'
import cardImage from '../images/card.png'
import cardImage2 from '../images/card2.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'
import crmIcon from '../images/crm.png'
import supportIcon from '../images/support.png'
import securatiyIcon from '../images/securatiy.png'
import oneclickIcon from '../images/oneclick.png'
import oplataIcon from '../images/oplata.png'
import trackingIcon from '../images/tracking.png'
import bonuscardIcon from '../images/bonuscard.png'
import cashIcon from '../images/cash.png'

export default function Home() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const cardImages = [cardImage, cardImage2]

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'qaraa.asia'
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
          <div>
            <h1 className="home-hero-title" style={{
              fontSize: '80px',
              fontWeight: '700',
              lineHeight: '1.05',
              marginBottom: '32px',
              color: '#1d1d1f',
              letterSpacing: '-0.015em'
            }}>
              qaraa — выбирай осознанно.<br className="mobile-break" /> Ваш стиль. Ваш выбор.
            </h1>
          </div>

          <div className="home-human-container" style={{
            position: 'relative'
          }}>
            <img
              src={humanImage}
              className="home-human-image"
              alt="qaraa fashion"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats-section" style={{
        padding: '120px 0',
        background: '#f5f5f7',
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
            fontWeight: '700',
            lineHeight: '1.05',
            marginBottom: '32px',
            color: '#1d1d1f',
            letterSpacing: '-0.015em',
            maxWidth: '900px'
          }}>
            Почему выбирают именно нас?
          </h2>

          <p style={{
            fontSize: '21px',
            color: '#6e6e73',
            lineHeight: '1.47',
            marginBottom: '80px',
            maxWidth: '900px',
            fontWeight: '400'
          }}>
            Нам не интересна прибыль — нам важно сохранить каждого клиента.
            Для этого мы каждый день развиваемся и стараемся улучшить экосистему,
            чтобы было удобнее для вас.
          </p>

          <div className="home-steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {[
              {
                number: '01',
                icon: crmIcon,
                title: 'Собственный CRM',
                description: 'Мы разработали собственную CRM-систему для управления заказами, клиентами и товарами — всё работает быстро и стабильно'
              },
              {
                number: '02',
                icon: supportIcon,
                title: 'Поддержка 24/7',
                description: 'Наши продавцы всегда в сети, даже если заняты — мы разработали собственный ИИ'
              },
              {
                number: '03',
                icon: securatiyIcon,
                title: 'Безопасность',
                description: 'Наша система — полностью зашифрованная закрытая экосистема. Мы никогда не разглашаем информацию о клиентах, так мы сохраняем доверие'
              },
              {
                number: '04',
                icon: oneclickIcon,
                title: 'Всё в один клик',
                description: 'Команда qaraa.crm разрабатывает и улучшает качество системы — вы можете заказать онлайн и отслеживать свои заказы'
              },
              {
                number: '05',
                icon: oplataIcon,
                title: 'Удобная оплата',
                description: 'У нас 3 видов оплаты: Kaspi, Freedom, Halyk'
                // description: 'У нас 5 видов оплаты: Kaspi Alaqan, QR-код, Карта, Apple Pay и Удаленная оплата'
              },
              {
                number: '06',
                icon: trackingIcon,
                title: 'Отслеживание товаров',
                description: 'Вы можете отслеживать наши товары прямо в системе и узнать, какой продавец сегодня на смене'
              },
              {
                number: '07',
                icon: bonuscardIcon,
                title: 'Бонусная карта',
                description: 'Каждая покупка — это не просто товар. Это шаг к персональной бонусной карте, которая будет работать даже через Apple Wallet'
                // description: 'Каждая покупка — это не просто товар. Это шаг к персональной бонусной карте, которая работает даже через Apple Wallet'
              },
              {
                number: '08',
                icon: cashIcon,
                title: 'Кэшбэк 5%',
                description: 'После каждой покупки на вашу бонусную карту начисляется 5% кэшбэк, который можно потратить на следующие заказы'
              }
            ].map((item, i) => (
              <div key={i} className="home-step-card" style={{
                background: '#FFFFFF',
                padding: '40px',
                borderRadius: '18px',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '0',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)'
                }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: '0.1',
                  transform: 'rotate(15deg)'
                }}>
                  <img
                    src={item.icon}
                    alt=""
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div style={{
                  marginBottom: '20px'
                }}>
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div className="home-step-number" style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#999999',
                  marginBottom: '20px',
                  letterSpacing: '1px'
                }}>
                  {item.number}
                </div>
                <h3 className="home-step-title" style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '12px',
                  letterSpacing: '-0.01em'
                }}>
                  {item.title}
                </h3>
                <p className="home-step-description" style={{
                  fontSize: '17px',
                  color: '#6e6e73',
                  lineHeight: '1.47',
                  fontWeight: '400'
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Card Section */}
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
            fontWeight: '700',
            lineHeight: '1.05',
            marginBottom: '80px',
            color: '#1d1d1f',
            letterSpacing: '-0.015em',
            textAlign: 'center'
          }}>
            Наша бонусная карта
          </h2>

          <div className="home-card-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div
              className="home-card-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)'
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
                <div className="home-card-number" style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#000000',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  paddingRight: '10px',
                  marginTop: '3px'
                }}>
                  4000 •••• •••• 1234
                </div>

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
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(0, 0, 0, 0.04)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: '#1d1d1f',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 1)'
                  e.target.style.transform = 'translateY(-50%) scale(1.05)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.92)'
                  e.target.style.transform = 'translateY(-50%) scale(1)'
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
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
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(0, 0, 0, 0.04)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '22px',
                  color: '#1d1d1f',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 1)'
                  e.target.style.transform = 'translateY(-50%) scale(1.05)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.92)'
                  e.target.style.transform = 'translateY(-50%) scale(1)'
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
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
                      background: currentCardIndex === index ? '#1d1d1f' : 'rgba(29, 29, 31, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: currentCardIndex === index ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="home-card-text-container">
              <p style={{
                fontSize: '21px',
                color: '#6e6e73',
                lineHeight: '1.47',
                marginBottom: '48px',
                fontWeight: '400'
              }}>
                Получите персональную карту qaraa с кэшбэком 5% на каждую покупку.
                Карта работает в Apple Wallet и всегда в цифровом виде.
              </p>
              <button
                onClick={() => navigate('/card-info')}
                style={{
                  padding: '12px 24px',
                  background: '#007AFF',
                  border: 'none',
                  borderRadius: '980px',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                  letterSpacing: '-0.01em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.4)'
                  e.target.style.background = '#0071e3'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)'
                  e.target.style.background = '#007AFF'
                }}>
                Подробнее о карте
              </button>
            </div>
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

      {/* Mobile Styles */}
      <style>{`
        /* Скрываем перенос на десктопе */
        .mobile-break {
          display: none;
        }
        
        @media (max-width: 768px) {
          /* Показываем перенос на мобильных */
          .mobile-break {
            display: inline;
          }
          
          .home-hero-title {
            font-size: 48px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.015em !important;
          }
          
          .home-step-card {
            margin-bottom: 32px !important;
          }
          .home-step-card:last-child {
            margin-bottom: 40px !important;
          }
          
          /* Bonus Card Section - мобильная версия */
          .home-benefits-section {
            padding: 60px 0 !important;
          }
          
          .home-benefits-container {
            padding: 0 20px !important;
          }
          
          .home-benefits-title {
            font-size: 36px !important;
            margin-bottom: 40px !important;
          }
          
          .home-card-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .home-card-text-container {
            margin-bottom: 40px !important;
          }
          
          /* Скрываем стрелки навигации на мобильных */
          .home-card-nav-btn {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          /* Footer - мобильная версия */
          footer {
            margin-top: -40px !important;
            padding: 50px 20px 35px !important;
            border-radius: 60px 60px 0 0 !important;
          }
          
          footer > div:first-child {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          footer > div:first-child > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 35px !important;
            margin-bottom: 35px !important;
            padding: 0 !important;
          }
          
          footer > div:first-child > div:first-child > div:first-child > div:first-child {
            font-size: 20px !important;
            margin-bottom: 10px !important;
          }
          
          footer > div:first-child > div:first-child > div:first-child > div:last-child {
            font-size: 14px !important;
          }
          
          footer > div:first-child > div:first-child > div > div:first-child {
            font-size: 11px !important;
            margin-bottom: 15px !important;
          }
          
          footer > div:first-child > div:first-child > div > div:not(:first-child),
          footer > div:first-child > div:first-child > div > a {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }
          
          footer > div:first-child > div:last-child {
            margin-top: 50px !important;
            padding-top: 30px !important;
            border-top: 2px solid rgba(0, 0, 0, 0.06) !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            font-size: 13px !important;
          }
          
          footer > div:first-child > div:last-child > div:last-child {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}