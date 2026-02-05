import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../pages/Home.css'

export default function Contacts() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
            Свяжитесь с нами
          </h1>
          <p style={{
            fontSize: '24px',
            color: '#666666',
            lineHeight: '1.6',
            maxWidth: '800px'
          }}>
            Мы всегда на связи. Выберите удобный способ — ответим в течение 5 минут.
          </p>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section style={{
        padding: '120px 0',
        background: '#F8F8F8'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {[
              {
                title: 'WhatsApp',
                description: 'Напишите нам в WhatsApp',
                contact: '+7 777 830 75 88',
                link: 'https://wa.me/77778307588',
                icon: '📱'
              },
              {
                title: 'Telegram',
                description: 'Напишите в наш Telegram',
                contact: '@qaraa_kz',
                link: 'https://t.me/qaraa_kz',
                icon: '✈️'
              },
              {
                title: 'Email',
                description: 'Отправьте письмо',
                contact: 'поддержка@qaraa.kz',
                link: 'mailto:поддержка@qaraa.kz',
                icon: '✉️'
              },
              {
                title: 'Телефон',
                description: 'Позвоните нам',
                contact: '+7 777 830 75 88',
                link: 'tel:+77778307588',
                icon: '📞'
              }
            ].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  background: '#FFFFFF',
                  padding: '48px',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '24px'
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666666',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {item.description}
                </p>
                <p style={{
                  fontSize: '18px',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  {item.contact}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Office Info Section */}
      <section style={{
        padding: '120px 0',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '64px',
                fontWeight: '600',
                lineHeight: '1.1',
                marginBottom: '32px',
                color: '#000000',
                letterSpacing: '-2px'
              }}>
                Наш офис
              </h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#999999',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Адрес
                  </div>
                  <div style={{
                    fontSize: '20px',
                    color: '#000000',
                    lineHeight: '1.6'
                  }}>
                    Алматы, Казахстан
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#999999',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Режим работы
                  </div>
                  <div style={{
                    fontSize: '20px',
                    color: '#000000',
                    lineHeight: '1.6'
                  }}>
                    Поддержка 24/7<br />
                    Офис: Пн-Пт, 10:00 - 19:00
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#999999',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Социальные сети
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '16px'
                  }}>
                    {[
                      { name: 'Instagram', url: 'https://www.instagram.com/qaraa.kz?igsh=cWw3cmlsNmJ0ZHRi' },
                      { name: 'TikTok', url: 'https://www.tiktok.com/@qaraa.kz?_r=1&_t=ZM-91EaJ8tj6Do' }
                    ].map((social, i) => (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '12px 24px',
                          background: '#F8F8F8',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#000000',
                          textDecoration: 'none',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#000000'}
                        onMouseLeave={(e) => e.target.style.background = '#F8F8F8'}
                        onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                        onMouseOut={(e) => e.target.style.color = '#000000'}
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#F8F8F8',
              padding: '60px',
              borderRadius: '24px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#666666'
              }}>
                <div style={{
                  fontSize: '80px',
                  marginBottom: '24px'
                }}>
                  📍
                </div>
                <p style={{
                  fontSize: '20px',
                  lineHeight: '1.6'
                }}>
                  Карта офиса<br />
                  скоро будет доступна
                </p>
              </div>
            </div>
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
