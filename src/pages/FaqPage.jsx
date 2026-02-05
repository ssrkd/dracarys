import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../pages/Home.css'

export default function FAQ() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openQuestion, setOpenQuestion] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const faqs = [
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
      answer: 'Доставка по Астане осуществляется в течение 1-2 дней. По Казахстану — 3-7 дней. Стоимость доставки рассчитывается автоматически при оформлении заказа. При заказе от 20 000 ₸ — доставка бесплатная.'
    },
    {
      question: 'Как отследить заказ?',
      answer: 'После оформления заказа вы получите трек-номер в SMS. Также можете отслеживать статус заказа в личном кабинете или через нашу CRM-систему в режиме реального времени.'
    },
    {
      question: 'Безопасны ли мои данные?',
      answer: 'Да, все данные защищены банковским уровнем шифрования. Мы никогда не передаём информацию о клиентах третьим лицам и не используем её в рекламных целях.'
    },
    {
      question: 'Как связаться с поддержкой?',
      answer: 'Поддержка работает 24/7 через чат на сайте, WhatsApp (+7 777 830 75 88), Telegram (@qaraa_kz) или по email поддержка@qaraa.kz. Время ответа — до 5 минут.'
    },
    {
      question: 'Можно ли оплатить бонусами всю покупку?',
      answer: 'Бонусами можно оплатить до 50% от суммы заказа. Остальные 50% оплачиваются одним из доступных способов оплаты.'
    },
    {
      question: 'Что делать, если товар пришёл с браком?',
      answer: 'Свяжитесь с поддержкой в течение 24 часов с момента получения. Мы бесплатно заменим товар или вернём деньги. Обратная доставка — за наш счёт.'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Fixed Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5'
      }}>
        <div className="home-header-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="home-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer' }} onClick={() => navigate('/')}>
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

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              className="home-header-button-login"
              style={{
                padding: '10px 24px',
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000000',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.05)'}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/login?mode=register')}
              className="home-header-button-register"
              style={{
                padding: '10px 24px',
                background: '#000000',
                border: 'none',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333333'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#000000'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              Регистрация
            </button>

            {/* Мобильное меню */}
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
            top: '89px',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E5E5',
            padding: '24px',
            zIndex: 99,
            display: 'none',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <button
            onClick={() => {
              navigate('/login')
              setMobileMenuOpen(false)
            }}
            style={{
              padding: '14px 24px',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000000',
              cursor: 'pointer',
              width: '100%'
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
              padding: '14px 24px',
              background: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Регистрация
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="home-hero-section" style={{
        paddingTop: '200px',
        paddingBottom: '120px',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <h1 style={{
            fontSize: '80px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '32px',
            color: '#000000',
            letterSpacing: '-3px',
            maxWidth: '900px'
          }}>
            Частые вопросы
          </h1>
          <p style={{
            fontSize: '24px',
            color: '#666666',
            lineHeight: '1.6',
            maxWidth: '800px'
          }}>
            Ответы на самые популярные вопросы о qaraa. Не нашли ответ? Напишите нам!
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: '120px 0',
        background: '#F8F8F8'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s'
              }}>
                <button
                  onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '32px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px'
                  }}
                >
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#000000',
                    letterSpacing: '-0.3px',
                    margin: 0
                  }}>
                    {faq.question}
                  </h3>
                  <div style={{
                    fontSize: '24px',
                    color: '#000000',
                    transition: 'transform 0.3s',
                    transform: openQuestion === i ? 'rotate(45deg)' : 'rotate(0)',
                    flexShrink: 0
                  }}>
                    +
                  </div>
                </button>
                {openQuestion === i && (
                  <div style={{
                    padding: '0 32px 32px',
                    fontSize: '16px',
                    color: '#666666',
                    lineHeight: '1.6',
                    animation: 'fadeIn 0.3s ease-in'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{
        padding: '120px 0',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '64px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '32px',
            color: '#000000',
            letterSpacing: '-2px'
          }}>
            Не нашли ответ?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#666666',
            lineHeight: '1.6',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Свяжитесь с нашей поддержкой — мы отвечаем в течение 5 минут
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://wa.me/77778307588"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '20px 48px',
                background: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              WhatsApp
            </a>
            <a
              href="https://t.me/qaraa_kz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '20px 48px',
                background: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Telegram
            </a>
            <a
              href="mailto:поддержка@qaraa.kz"
              style={{
                padding: '20px 48px',
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#000000',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.05)'}
            >
              Email
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer" style={{
        padding: '80px 0 40px',
        background: '#000000',
        borderTop: '1px solid #1A1A1A'
      }}>
        <div className="home-footer-container" style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <div className="home-footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px',
            marginBottom: '64px'
          }}>
            <div>
              <div className="home-footer-logo" style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: '24px'
              }}>
                qaraa.kz
              </div>
              <p className="home-footer-description" style={{
                fontSize: '15px',
                color: '#666666',
                lineHeight: '1.6'
              }}>
                Безопасная экосистема
              </p>
            </div>

            <div>
              <div className="home-footer-section-title" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#999999',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Навигация
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'О нас', path: '/about-us' },
                  { name: 'Бонусная карта', path: '/card-info' },
                  { name: 'FAQ', path: '/faq' },
                  { name: 'Контакты', path: '/contacts' }
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(link.path)
                    }}
                    className="home-footer-link"
                    style={{
                      fontSize: '15px',
                      color: '#666666',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#999999',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Социальные сети
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Instagram', url: 'https://www.instagram.com/qaraa.kz?igsh=cWw3cmlsNmJ0ZHRi' },
                  { name: 'Telegram', url: 'https://t.me/qaraa_kz' },
                  { name: 'WhatsApp', url: 'https://wa.me/77778307588' },
                  { name: 'TikTok', url: 'https://www.tiktok.com/@qaraa.kz?_r=1&_t=ZM-91EaJ8tj6Do' }
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '15px',
                      color: '#666666',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="home-footer-bottom" style={{
            paddingTop: '32px',
            borderTop: '1px solid #1A1A1A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p className="home-footer-bottom-text" style={{
              fontSize: '14px',
              color: '#666666'
            }}>
              © 2026 qaraa.kz | Все права защищены.
            </p>
            <div className="home-footer-bottom-links" style={{ display: 'flex', gap: '24px' }}>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/privacy')
                }}
                className="home-footer-bottom-link"
                style={{
                  fontSize: '14px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.target.style.color = '#666666'}
              >
                Политика конфиденциальности
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/terms')
                }}
                className="home-footer-bottom-link"
                style={{
                  fontSize: '14px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.target.style.color = '#666666'}
              >
                Пользовательское соглашение
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
