import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../pages/Home.css'

export default function Aboutus() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Fixed Header */}
      <header className="home-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div className="home-header-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div 
            onClick={() => navigate('/')}
            className="home-logo-container"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px',
              cursor: 'pointer'
            }}
          >
            <img 
              src={logoQaraa} 
              alt="qaraa"
              className="home-logo"
              style={{
                height: '50px',
                width: 'auto'
              }}
            />
            <div>
              <div className="home-logo-title" style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#000000',
                letterSpacing: '-0.3px',
                marginBottom: '2px'
              }}>
                qaraa.kz
              </div>
              <div className="home-logo-subtitle" style={{
                fontSize: '13px',
                color: '#999999',
                fontWeight: '500'
              }}>
                Безопасная экосистема
              </div>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="home-header-buttons" style={{ 
            display: 'flex', 
            gap: '12px'
          }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 32px',
                background: 'rgba(0, 0, 0, 0.05)',
                color: '#000000',
                fontSize: '15px',
                fontWeight: '500',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.05)'}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/login?mode=register')}
              style={{
                padding: '12px 32px',
                background: '#000000',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '500',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333333'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#000000'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Регистрация
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="home-mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              width: '40px',
              height: '40px',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '14px'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                background: '#000000',
                top: mobileMenuOpen ? '6px' : '0',
                transform: mobileMenuOpen ? 'rotate(45deg)' : 'rotate(0)',
                transition: 'all 0.3s'
              }} />
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                background: '#000000',
                top: '6px',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'all 0.3s'
              }} />
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                background: '#000000',
                top: mobileMenuOpen ? '6px' : '12px',
                transform: mobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0)',
                transition: 'all 0.3s'
              }} />
            </div>
          </button>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div 
              className="home-mobile-menu"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <button
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
                style={{
                  padding: '14px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  color: '#000000',
                  fontSize: '15px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center'
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
                  padding: '14px',
                  background: '#000000',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Регистрация
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero-section fade-in-up" style={{
        paddingTop: '140px',
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
          <div className="home-hero-text-wrapper">
            <h1 className="home-hero-title about-section-title about-hero-main-title" style={{
              fontSize: '80px',
              fontWeight: '600',
              lineHeight: '1.1',
              marginBottom: '32px',
              color: '#000000',
              letterSpacing: '-3px'
            }}>
              qaraa.kz — Безопасная экосистема.
            </h1>
            <p className="home-hero-description about-hero-description-desktop" style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#666666',
              lineHeight: '1.5',
              margin: 0
            }}>
              Мы создаём закрытую экосистему для продавцов и покупателей, где каждый чувствует себя в безопасности
            </p>
          </div>

          <div className="home-human-container" style={{
            position: 'relative'
          }}>
            <img 
              src="/src/images/qaraasec3.png"
              className="home-human-image" 
              alt="qaraa ecosystem"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          {/* Мобильное описание - показывается только на мобильном */}
          <p className="home-hero-description about-hero-description-mobile" style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#666666',
            lineHeight: '1.5',
            margin: 0,
            display: 'none'
          }}>
            Мы создаём закрытую экосистему для продавцов и покупателей, где каждый чувствует себя в безопасности
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="fade-in-up about-story-section" style={{
        padding: '10px 0 10px 0',
        background: '#F8F8F8'
      }}>
        <div className="about-story-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <div className="about-story-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#999999',
                letterSpacing: '2px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                КАК МЫ НАЧАЛИ
                <img 
                  src="/src/images/kakmi.png"
                  alt="kakmi"
                  style={{
                    height: '20px',
                    width: 'auto',
                    display: 'inline-block',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <h2 className="about-section-title" style={{
                fontSize: '48px',
                fontWeight: '600',
                lineHeight: '1.1',
                marginBottom: '32px',
                color: '#000000',
                letterSpacing: '-2px'
              }}>
                История qaraa.kz | qaraa.crm
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: '1.7',
                marginBottom: '24px'
              }}>
                Мы давно мечтали открыть онлайн-магазин, но боялись: много конкурентов, нет гарантий продаж. Но в 2025 году мы максимально сфокусировались и полностью отдали все свои силы, чтобы запустить проект.
              </p>
              <p style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: '1.7',
                marginBottom: '24px'
              }}>
                Первый сайт создали, но им почти никто не пользовался. Открыли онлайн-магазин, и потом мы увидели у конкурента CRM-систему и задумались: если в будущем мы откроем офлайн-точку, нам же потребуется CRM-система. И тогда решили: зачем платить кому-то за услугу с непонятными кнопками, если можем создать свою?
              </p>
              <p style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: '1.7',
                marginBottom: '24px'
              }}>
                Так началась <strong>qaraa.crm</strong> — закрытая безопасная экосистема. Доступ только у владельца и продавцов. Мы сделали максимально понятный интерфейс и даже создали собственный ИИ. Это выделило нас среди конкурентов.
              </p>
              <p style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: '1.7',
                marginBottom: '10px'
              }}>
                Когда CRM была почти готова, мы поняли: старый сайт не работает. Но теперь у нас есть своя система! Мы пересоздали сайт <strong>qaraa.kz</strong> с нуля. И тогда задумались: у нас своя CRM-система, мы же можем добавить бонусную систему! Добавили бонусную программу и объединили всё в одной экосистеме. И каждый день продолжаем развиваться и улучшать сервис.
              </p>

              {/* Логотип объединения qaraa.kz × qaraa.crm */}
              <div className="about-logos-container" style={{
                marginTop: '24px',
                display: 'flex'
              }}>
                <img 
                  src="/src/images/qaraaxqaraa-crm.png"
                  alt="qaraa.kz × qaraa.crm"
                  className="about-logos-combined"
                  style={{
                    height: '200px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            <div className="about-story-card" style={{
              background: 'linear-gradient(135deg, #F5F5F7 0%, #E8E8EA 100%)',
              padding: '60px',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                filter: 'blur(40px)'
              }} />
              <div style={{
                fontSize: '80px',
                fontWeight: '700',
                color: '#000000',
                marginBottom: '16px',
                letterSpacing: '-3px',
                position: 'relative'
              }}>
                2025
              </div>
              <div style={{
                fontSize: '20px',
                color: '#666666',
                fontWeight: '500',
                position: 'relative'
              }}>
                Год основания qaraa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="fade-in-up about-mission-section" style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #FAF9F6 0%, #F5F3EE 50%, #F0EDE5 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Верхняя волна */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '80px',
          transform: 'translateY(-1px)'
        }} viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,0 L0,0 Z" fill="#F8F8F8"/>
        </svg>

        {/* Нижняя волна */}
        <svg style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '80px',
          transform: 'translateY(1px)'
        }} viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z" fill="#FFFFFF"/>
        </svg>

        {/* Волнообразная декоративная форма */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '120%',
          height: '130%',
          background: 'linear-gradient(135deg, rgba(245, 235, 220, 0.4) 0%, rgba(230, 220, 205, 0.3) 100%)',
          borderRadius: '60% 30% 70% 40%',
          transform: 'rotate(-8deg)',
          opacity: 0.7
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(225deg, rgba(255, 250, 240, 0.3) 0%, rgba(245, 240, 230, 0.2) 100%)',
          borderRadius: '40% 70% 50% 60%',
          transform: 'rotate(12deg)',
          opacity: 0.5
        }} />
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666666',
            letterSpacing: '2px',
            marginBottom: '16px'
          }}>
            НАША ЦЕЛЬ
          </div>
          <h2 className="about-section-title" style={{
            fontSize: '56px',
            fontWeight: '600',
            lineHeight: '1.2',
            marginBottom: '40px',
            color: '#000000',
            letterSpacing: '-2px'
          }}>
            Мы не гонимся за прибылью.<br />Мы ценим доверие.
          </h2>
          <p style={{
            fontSize: '21px',
            color: '#444444',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Наша миссия проста: создать место, куда люди хотят возвращаться. Не из-за скидок или акций, а потому что здесь честно, удобно и безопасно.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="fade-in-up" style={{
        padding: '120px 0',
        background: '#F8F8F8'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <h2 className="about-section-title" style={{
            fontSize: '64px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '32px',
            color: '#000000',
            letterSpacing: '-2px',
            maxWidth: '900px'
          }}>
            Почему выбирают именно нас?
          </h2>
          
          <p style={{
            fontSize: '20px',
            color: '#666666',
            lineHeight: '1.6',
            marginBottom: '80px',
            maxWidth: '900px'
          }}>
            Нам не интересна прибыль — нам важно сохранить каждого клиента. 
            Для этого мы каждый день развиваемся и стараемся улучшить экосистему, 
            чтобы было удобнее для вас.
          </p>

          <div className="about-values-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {[
              {
                icon: 'secutiryus.png',
                title: 'Безопасность',
                desc: 'Банковское шифрование данных. Двухфакторная аутентификация. Полный контроль над информацией.'
              },
              {
                icon: 'chestnostus.png',
                title: 'Честность',
                desc: '5% кэшбэка — это реальные 5%. Никаких скрытых условий, ограничений или мелкого шрифта.'
              },
              {
                icon: 'inovationus.png',
                title: 'Инновации',
                desc: 'Современные технологии для максимального удобства. Быстро, просто, интуитивно.'
              },
              {
                icon: 'supportus.png',
                title: 'Поддержка',
                desc: 'Реальные люди, которые помогают 24/7. Не боты, не скрипты — живая команда.'
              },
              {
                icon: 'razvitieus.png',
                title: 'Развитие',
                desc: 'Мы слушаем вас. Каждое обновление основано на реальных отзывах клиентов.'
              },
              {
                icon: 'dostupus.png',
                title: 'Доступность',
                desc: 'Доставка по всему Казахстану. Удобные способы оплаты. Без ограничений.'
              }
            ].map((value, index) => (
              <div
                key={index}
                className="about-value-card-animated"
                style={{
                  background: '#FFFFFF',
                  padding: '40px',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: '0.1',
                  transform: 'rotate(15deg)'
                }}>
                  <img 
                    src={`/src/images/${value.icon}`}
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
                    src={`/src/images/${value.icon}`}
                    alt={value.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666666',
                  lineHeight: '1.6'
                }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="fade-in-up" style={{
        padding: '120px 0',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#999999',
              letterSpacing: '2px',
              marginBottom: '16px'
            }}>
              ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
            </div>
            <h2 className="about-section-title" style={{
              fontSize: '48px',
              fontWeight: '600',
              lineHeight: '1.1',
              color: '#000000',
              letterSpacing: '-2px',
              marginBottom: '24px'
            }}>
              Ответы на ваши вопросы
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#666666',
              lineHeight: '1.5'
            }}>
              Всё, что нужно знать о qaraa
            </p>
          </div>

          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {[
              {
                question: 'Как получить бонусную карту qaraa?',
                answer: 'Зарегистрируйтесь на сайте qaraa.kz, и карта автоматически создастся в вашем личном кабинете. Вы также сможете добавить её в Apple Wallet для удобного использования.'
              },
              {
                question: 'Как работает кэшбэк 5%?',
                answer: 'После каждой покупки на вашу бонусную карту автоматически начисляется 5% от суммы покупки. Бонусы можно использовать для оплаты следующих покупок.'
              },
              {
                question: 'Где я могу использовать бонусы?',
                answer: 'Бонусы можно использовать при покупке любых товаров в магазинах qaraa или на сайте qaraa.kz. Минимальная сумма для использования бонусов — 100 ₸.'
              },
              {
                question: 'Как долго действуют бонусы?',
                answer: 'Бонусы действуют 12 месяцев с момента начисления. После истечения срока неиспользованные бонусы сгорают.'
              },
              {
                question: 'Какие способы оплаты доступны?',
                answer: 'Мы принимаем: Kaspi Alaqan, QR-код, Банковские карты (Visa/MasterCard), Apple Pay и Удалённую оплату.'
              },
              {
                question: 'Как работает доставка?',
                answer: 'Доставка по Астане осуществляется в течение 1-2 дней. По Казахстану — 3-7 дней.'
              },
              {
                question: 'Безопасны ли мои данные?',
                answer: 'Да, все данные защищены банковским уровнем шифрования. Мы никогда не передаём информацию о клиентах третьим лицам.'
              },
              {
                question: 'Как связаться с поддержкой?',
                answer: 'Поддержка работает через WhatsApp (+7 776 888 30 07), Telegram (@sssssrkd).'
              },
              {
                question: 'Можно ли оплатить бонусами всю покупку?',
                answer: 'Бонусами можно оплатить до 50% от суммы заказа. Остальные 50% оплачиваются одним из доступных способов оплаты.'
              },
              {
                question: 'Что делать, если товар пришёл с браком?',
                answer: 'Свяжитесь с поддержкой в течение 24 часов с момента получения.'
              }
            ].map((faq, index) => {
              const [isOpen, setIsOpen] = React.useState(false)
              return (
                <div
                  key={index}
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                  }}
                >
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                      width: '100%',
                      padding: '24px 32px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#000000'
                    }}>
                      {faq.question}
                    </span>
                    <span style={{
                      fontSize: '24px',
                      color: '#000000',
                      transition: 'transform 0.3s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                      fontWeight: '300'
                    }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 32px 24px',
                      fontSize: '16px',
                      color: '#666666',
                      lineHeight: '1.6',
                      animation: 'fadeIn 0.3s ease-out'
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="fade-in-up" style={{
        padding: '120px 0',
        background: '#F5F5F7'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#999999',
              letterSpacing: '2px',
              marginBottom: '16px'
            }}>
              СВЯЖИТЕСЬ С НАМИ
            </div>
            <h2 className="about-section-title" style={{
              fontSize: '48px',
              fontWeight: '600',
              lineHeight: '1.1',
              color: '#000000',
              letterSpacing: '-2px',
              marginBottom: '24px'
            }}>
              Наши контакты
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#666666',
              lineHeight: '1.5'
            }}>
              Мы всегда на связи и готовы помочь
            </p>
          </div>

          <div className="about-contact-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            marginBottom: '80px'
          }}>
            {[
              {
                icon: '💬',
                title: 'WhatsApp',
                desc: 'Быстрая связь в мессенджере',
                contact: '+7 777 830 75 88',
                link: 'https://wa.me/77778307588'
              },
              {
                icon: '✈️',
                title: 'Telegram',
                desc: 'Напишите нам в Telegram',
                contact: '@qaraa_kz',
                link: 'https://t.me/qaraa_kz'
              },
              {
                icon: '📧',
                title: 'Email',
                desc: 'Электронная почта',
                contact: 'поддержка@qaraa.kz',
                link: 'mailto:поддержка@qaraa.kz'
              },
              {
                icon: '📞',
                title: 'Телефон',
                desc: 'Позвоните нам',
                contact: '+7 777 830 75 88',
                link: 'tel:+77778307588'
              }
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#FFFFFF',
                  padding: '40px 32px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  border: '1px solid transparent',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.borderColor = '#000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  {contact.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '8px'
                }}>
                  {contact.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#999999',
                  marginBottom: '12px'
                }}>
                  {contact.desc}
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#000000',
                  fontWeight: '500'
                }}>
                  {contact.contact}
                </p>
              </a>
            ))}
          </div>

          {/* Office Info */}
          <div style={{
            background: '#FFFFFF',
            padding: '60px',
            borderRadius: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '32px',
              letterSpacing: '-1px'
            }}>
              Наш офис
            </h3>
            <div className="about-office-info" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#999999',
                  marginBottom: '8px',
                  fontWeight: '600',
                  letterSpacing: '1px'
                }}>
                  АДРЕС
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#000000',
                  fontWeight: '500'
                }}>
                  Алматы, Казахстан
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#999999',
                  marginBottom: '8px',
                  fontWeight: '600',
                  letterSpacing: '1px'
                }}>
                  ПОДДЕРЖКА
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#000000',
                  fontWeight: '500'
                }}>
                  24/7
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#999999',
                  marginBottom: '8px',
                  fontWeight: '600',
                  letterSpacing: '1px'
                }}>
                  ОФИС
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#000000',
                  fontWeight: '500'
                }}>
                  Пн-Пт 10:00-19:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="fade-in-up" style={{
        padding: '120px 0',
        background: '#000000',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 className="about-cta-title" style={{
            fontSize: '56px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '24px',
            color: '#FFFFFF',
            letterSpacing: '-2px'
          }}>
            Станьте частью qaraa
          </h2>
          <p className="about-cta-text" style={{
            fontSize: '21px',
            color: '#CCCCCC',
            lineHeight: '1.5',
            marginBottom: '48px'
          }}>
            Присоединяйтесь к экосистеме, где каждая покупка приносит реальную ценность
          </p>
          <button
            onClick={() => navigate('/login?mode=register')}
            style={{
              padding: '18px 56px',
              background: '#FFFFFF',
              color: '#000000',
              fontSize: '18px',
              fontWeight: '600',
              borderRadius: '28px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px) scale(1.05)'
              e.target.style.boxShadow = '0 12px 32px rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.2)'
            }}
          >
            Начать сейчас →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer" style={{
        background: '#000000',
        color: '#FFFFFF',
        padding: '80px 0 40px',
        borderTop: '1px solid #1A1A1A'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div className="home-footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '60px'
          }}>
            {/* Brand */}
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
                qaraa.kz
              </div>
              <div style={{
                fontSize: '14px',
                color: '#86868B'
              }}>
                Безопасная экосистема
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#86868B'
              }}>
                Навигация
              </div>
              {[
                { name: 'О нас', path: '/about-us' },
                { name: 'Карьера', path: '/career' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Контакты', path: '/contacts' }
              ].map((link, index) => (
                <div
                  key={index}
                  onClick={() => navigate(link.path)}
                  style={{
                    fontSize: '14px',
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#86868B'}
                  onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                >
                  {link.name}
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#86868B'
              }}>
                Социальные сети
              </div>
              {[
                { name: 'Instagram', url: 'https://www.instagram.com/qaraa.kz?igsh=cWw3cmlsNmJ0ZHRi' },
                { name: 'Telegram', url: 'https://t.me/qaraa_kz' },
                { name: 'WhatsApp', url: 'https://wa.me/77778307588' },
                { name: 'TikTok', url: 'https://www.tiktok.com/@qaraa.kz?_r=1&_t=ZM-91EaJ8tj6Do' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#86868B'}
                  onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div style={{
            paddingTop: '40px',
            borderTop: '1px solid #333333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#86868B'
            }}>
              © 2026 qaraa.kz | Все права защищены.
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <span
                onClick={() => navigate('/privacy')}
                style={{
                  fontSize: '14px',
                  color: '#86868B',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.target.style.color = '#86868B'}
              >
                Политика конфиденциальности
              </span>
              <span
                onClick={() => navigate('/terms')}
                style={{
                  fontSize: '14px',
                  color: '#86868B',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.target.style.color = '#86868B'}
              >
                Пользовательское соглашение
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Animations and Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        /* Desktop positioning for combined logos — controllable and separate from mobile rules */
        .about-logos-container {
          justify-content: flex-start;
          padding-left: 400px;
        }

        @media (max-width: 768px) {
          .home-header-container {
            padding: 16px 20px !important;
          }

          .home-logo-container {
            gap: 12px !important;
          }

          .home-logo {
            height: 35px !important;
          }

          .home-logo-title {
            font-size: 16px !important;
          }

          .home-logo-subtitle {
            font-size: 11px !important;
          }

          .home-hero-title {
            font-size: 42px !important;
            letter-spacing: -1.5px !important;
            margin-bottom: 24px !important;
          }

          .home-hero-container {
            padding: 0 20px !important;
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }

          .home-hero-text-wrapper {
            display: contents;
          }

          .about-hero-main-title {
            order: 1;
            margin-bottom: 32px !important;
          }

          .home-human-container {
            order: 2;
            margin-bottom: 24px;
          }

          .about-hero-description-desktop {
            display: none !important;
          }

          .about-hero-description-mobile {
            display: block !important;
            order: 3;
          }

          .home-hero-section {
            padding-top: 120px !important;
            padding-bottom: 60px !important;
          }
          
          .about-hero-title {
            font-size: 42px !important;
            letter-spacing: -1.5px !important;
            margin-bottom: 24px !important;
          }
          
          .about-hero-subtitle {
            font-size: 18px !important;
          }
          
          .about-section-title {
            font-size: 32px !important;
            letter-spacing: -1px !important;
          }

          .about-contact-grid {
            grid-template-columns: 1fr !important;
          }

          .about-office-info {
            grid-template-columns: 1fr !important;
          }

          .about-story-container {
            padding: 0 20px !important;
          }

          .about-story-section {
            padding: 60px 0 80px 0 !important;
          }

          .about-mission-section {
            padding: 100px 0 !important;
          }

          .about-logos-container {
            justify-content: center !important;
            padding-right: 30px !important;
            padding-left: 0 !important;
          }

          .about-logos-combined {
            height: 150px !important;
          }
          
          .about-story-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .about-story-card {
            padding: 40px 32px !important;
          }
          
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
          
          .about-timeline-item {
            padding-left: 60px !important;
          }
          
          .about-cta-title {
            font-size: 36px !important;
          }
          
          .about-cta-text {
            font-size: 18px !important;
          }
          
          .home-header-buttons {
            display: none !important;
          }
          
          .home-mobile-menu-button {
            display: block !important;
          }
          
          .home-mobile-menu {
            display: flex !important;
          }
          
          .home-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }

        @media (max-width: 480px) {
          .home-hero-title {
            font-size: 32px !important;
            letter-spacing: -1px !important;
            margin-bottom: 20px !important;
          }

          .home-hero-section {
            padding-top: 100px !important;
            padding-bottom: 50px !important;
          }

          .home-hero-container {
            padding: 0 16px !important;
          }
          
          .about-hero-title {
            font-size: 32px !important;
            letter-spacing: -1px !important;
            margin-bottom: 20px !important;
          }
          
          .about-story-card {
            padding: 32px 24px !important;
          }
          
          .about-value-card-animated {
            padding: 32px 24px !important;
          }
          
          .about-timeline-item {
            padding: 32px 24px !important;
            padding-left: 48px !important;
          }
        }
      `}</style>
    </div>
  )
}
