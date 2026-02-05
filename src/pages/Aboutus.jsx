import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'
import secutiryusIcon from '../images/secutiryus.png'
import chestnostusIcon from '../images/chestnostus.png'
import inovationusIcon from '../images/inovationus.png'
import supportusIcon from '../images/supportus.png'
import razvitieusIcon from '../images/razvitieus.png'
import dostupusIcon from '../images/dostupus.png'
import whatsappIcon from '../images/whatsapp.png'
import telegramIcon from '../images/telegram.png'
import callIcon from '../images/call.png'
import qaraasec2Image from '../images/qaraasec2.png'
import kakmiImage from '../images/kakmi.png'

export default function Aboutus() {
  usePageTitle('О нас')
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const values = [
    {
      icon: secutiryusIcon,
      title: 'Безопасность',
      desc: 'Банковское шифрование данных. Двухфакторная аутентификация. Полный контроль над информацией.',
      badge: '256-bit SSL'
    },
    {
      icon: chestnostusIcon,
      title: 'Честность',
      desc: '5% кэшбэка это реальные 5%. Никаких скрытых условий, ограничений или мелкого шрифта.',
      badge: '5% кэшбэк'
    },
    {
      icon: inovationusIcon,
      title: 'Инновации',
      desc: 'Современные технологии для максимального удобства. Быстро, просто, интуитивно.',
      badge: 'AI-powered'
    },
    {
      icon: supportusIcon,
      title: 'Поддержка',
      desc: 'Реальные люди, которые помогают 24/7. Не боты, не скрипты — живая команда.',
      badge: '24/7'
    },
    {
      icon: razvitieusIcon,
      title: 'Развитие',
      desc: 'Мы слушаем вас. Каждое обновление основано на реальных отзывах клиентов.',
      badge: 'User-driven'
    },
    {
      icon: dostupusIcon,
      title: 'Доступность',
      desc: 'Доставка по всему Казахстану. Удобные способы оплаты. Без ограничений.',
      badge: 'По всему KZ'
    }
  ]

  const faqs = [
    {
      q: 'Как получить бонусную карту qaraa?',
      a: 'Зарегистрируйтесь на сайте qaraa.kz, и карта автоматически создастся в вашем личном кабинете. Вы также сможете добавить её в Apple Wallet для удобного использования.'
    },
    {
      q: 'Как работает кэшбэк 5%?',
      a: 'После каждой покупки на вашу бонусную карту автоматически начисляется 5% от суммы покупки. Бонусы можно использовать для оплаты следующих покупок.'
    },
    {
      q: 'Где я могу использовать бонусы?',
      a: 'Бонусы можно использовать при покупке любых товаров в магазинах qaraa или на сайте qaraa.kz. Минимальная сумма для использования бонусов — 100 ₸.'
    },
    {
      q: 'Как долго действуют бонусы?',
      a: 'Бонусы действуют 12 месяцев с момента начисления. После истечения срока неиспользованные бонусы сгорают.'
    },
    {
      q: 'Какие способы оплаты доступны?',
      a: 'Мы принимаем: Kaspi Alaqan, QR-код, Банковские карты (Visa/MasterCard), Apple Pay и Удалённую оплату.'
    },
    {
      q: 'Как работает доставка?',
      a: 'Доставка по Астане осуществляется в течение 1-2 дней. По Казахстану — 3-7 дней.'
    }
  ]

  const contacts = [
    { icon: whatsappIcon, title: 'WhatsApp', value: '+7 777 830 75 88', link: 'https://wa.me/77778307588' },
    { icon: telegramIcon, title: 'Telegram', value: '@sakurariley', link: 'https://t.me/sakurariley' },
    { icon: callIcon, title: 'Телефон', value: '+7 777 830 75 88', link: 'tel:+77778307588' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F2F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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

      {/* Hero */}
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
          <div className="home-hero-text-wrapper">
            <h1 className="home-hero-title about-section-title about-hero-main-title" style={{
              fontSize: '80px',
              fontWeight: '600',
              lineHeight: '1.1',
              marginBottom: '32px',
              color: '#000000',
              letterSpacing: '-3px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              qaraa.kz — Безопасная экосистема.
            </h1>
            <p className="home-hero-description about-hero-description-desktop" style={{
              fontSize: '24px',
              fontWeight: '400',
              color: '#666666',
              lineHeight: '1.5',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Мы создаём закрытую экосистему для продавцов и покупателей, где каждый чувствует себя в безопасности
            </p>
          </div>

          <div className="home-human-container" style={{
            position: 'relative'
          }}>
            <img
              src={qaraasec2Image}
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
            display: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Мы создаём закрытую экосистему для продавцов и покупателей, где каждый чувствует себя в безопасности
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{
        padding: '80px 24px 60px',
        background: '#F2F2F7',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#8E8E93', letterSpacing: '1px' }}>
                  КАК МЫ НАЧАЛИ
                </span>
                <img src={kakmiImage} alt="" style={{ height: '16px' }} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1C1C1E', marginBottom: '20px' }}>
                История qaraa.kz | qaraa.crm
              </h2>
              <div style={{ fontSize: '15px', color: '#636366', lineHeight: '1.6', marginBottom: '16px' }}>
                Мы давно мечтали открыть онлайн-магазин, но боялись: много конкурентов, нет гарантий продаж. Но в 2025 году мы максимально сфокусировались и полностью отдали все свои силы, чтобы запустить проект.
              </div>
              <div style={{ fontSize: '15px', color: '#636366', lineHeight: '1.6', marginBottom: '16px' }}>
                Первый сайт создали, но им почти никто не пользовался. Открыли онлайн-магазин, и потом мы увидели у конкурента CRM-систему и задумались: если в будущем мы откроем офлайн-точку, нам же потребуется CRM-система. И тогда решили: зачем платить кому-то за услугу с непонятными кнопками, если можем создать свою?
              </div>
              <div style={{ fontSize: '15px', color: '#636366', lineHeight: '1.6', marginBottom: '16px' }}>
                Так началась <strong>qaraa.crm</strong> — закрытая безопасная экосистема. Доступ только у владельца и продавцов. Мы сделали максимально понятный интерфейс и даже создали собственный ИИ. Это выделило нас среди конкурентов.
              </div>
              <div style={{ fontSize: '15px', color: '#636366', lineHeight: '1.6', marginBottom: '24px' }}>
                Когда CRM была почти готова, мы поняли: старый сайт не работает. Но теперь у нас есть своя система! Мы пересоздали сайт <strong>qaraa.kz</strong> с нуля. И тогда задумались: у нас своя CRM-система, мы же можем добавить бонусную систему! Добавили бонусную программу и объединили всё в одной экосистеме. И каждый день продолжаем развиваться и улучшать сервис.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <img src={qaraaCrmLogo} alt="qaraa × qaraa.crm" style={{ height: '120px' }} />
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
              borderRadius: '16px',
              padding: '32px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                filter: 'blur(40px)'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '50%',
                filter: 'blur(30px)'
              }}></div>

              <div style={{
                fontSize: '72px',
                fontWeight: '800',
                marginBottom: '12px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #AEAEB2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative',
                zIndex: 1
              }}>
                2025
              </div>
              <div style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#AEAEB2',
                position: 'relative',
                zIndex: 1
              }}>
                Год основания qaraa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="advantages-section" style={{
        padding: '80px 24px',
        background: 'white',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="advantages-header" style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '900px', margin: '0 auto 60px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#8E8E93',
              letterSpacing: '1.5px',
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              ПРЕИМУЩЕСТВА
            </span>
            <h2 className="advantages-title" style={{
              fontSize: '42px',
              fontWeight: '700',
              color: '#1C1C1E',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '-1px'
            }}>
              Что делает qaraa особенным?
            </h2>
            <p className="advantages-description" style={{
              fontSize: '19px',
              color: '#636366',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Мы создали экосистему, где важен каждый клиент. Не просто магазин, а место, где вам действительно рады.
            </p>
          </div>
          <div className="advantages-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {values.map((v, i) => (
              <div key={i} className="advantage-card" style={{
                background: '#F8F8F8',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.borderColor = '#1C1C1E'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8F8F8'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)'
                }}>
                {/* Badge */}
                <div className="advantage-badge" style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {v.badge}
                </div>

                {/* Icon with gradient background */}
                <div className="advantage-icon-wrapper" style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                  <img src={v.icon} alt={v.title} style={{ width: '40px', height: '40px' }} />
                </div>

                {/* Title with underline effect */}
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1C1C1E',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                  position: 'relative',
                  paddingBottom: '8px'
                }}>
                  {v.title}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '40px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #1C1C1E 0%, transparent 100%)',
                    borderRadius: '2px'
                  }}></div>
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '16px',
                  color: '#636366',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" style={{
        padding: '80px 24px',
        background: '#F2F2F7',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="faq-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#8E8E93',
              letterSpacing: '1.5px',
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
            </span>
            <h2 className="faq-title" style={{
              fontSize: '42px',
              fontWeight: '700',
              color: '#1C1C1E',
              margin: '0 0 20px',
              lineHeight: '1.2',
              letterSpacing: '-1px'
            }}>
              Ответы на ваши вопросы
            </h2>
            <p className="faq-description" style={{
              fontSize: '17px',
              color: '#636366',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Не нашли ответ? Напишите нам в WhatsApp или Telegram.
            </p>
          </div>

          <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: openFaq === i ? '0 8px 24px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease'
              }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="faq-button" style={{
                  width: '100%',
                  padding: '24px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <span className="faq-question" style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1C1C1E',
                    flex: 1
                  }}>
                    {faq.q}
                  </span>
                  <div className="faq-icon" style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: openFaq === i ? '#1C1C1E' : '#F2F2F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      color: openFaq === i ? 'white' : '#1C1C1E',
                      transition: 'all 0.3s ease',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                      display: 'inline-block'
                    }}>
                      +
                    </span>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="faq-answer" style={{
                    padding: '0 24px 24px',
                    fontSize: '16px',
                    color: '#636366',
                    lineHeight: '1.7',
                    borderTop: '1px solid #F2F2F7',
                    marginTop: '-8px',
                    paddingTop: '24px',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts & Office - Drinkit Style (Two Cards Side by Side) */}
      <section className="contacts-section" style={{
        padding: '100px 24px',
        background: 'white',
        borderRadius: '60px 60px 0 0',
        marginTop: '-40px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Two Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            width: '100%'
          }}>

            {/* Card 1: Contacts */}
            <div style={{
              background: '#F8F9FA',
              borderRadius: '32px',
              padding: '48px 40px'
            }}>
              {/* Title */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '12px',
                  letterSpacing: '-1px'
                }}>
                  Свяжитесь с нами
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666666',
                  margin: 0
                }}>
                  Выберите удобный способ связи — ответим быстро и по делу
                </p>
              </div>

              {/* Pills - Method Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: '#4059F6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  WhatsApp
                </div>
                <div style={{
                  background: '#4059F6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Telegram
                </div>
                <div style={{
                  background: '#4059F6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Телефон
                </div>
              </div>

              {/* Contact Info Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px'
              }}>
                {contacts.map((c, i) => (
                  <a key={i} href={c.link} target="_blank" rel="noopener noreferrer" style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FAFAFA'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <img src={c.icon} alt={c.title} style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        color: '#999999',
                        marginBottom: '4px',
                        fontWeight: '600'
                      }}>
                        {c.title}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        color: '#000000',
                        fontWeight: '700',
                        letterSpacing: '-0.3px'
                      }}>
                        {c.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Card 2: Office Address */}
            <div style={{
              background: '#F8F9FA',
              borderRadius: '32px',
              padding: '48px 40px'
            }}>
              {/* Title */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '12px',
                  letterSpacing: '-1px'
                }}>
                  Наш офис
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666666',
                  margin: 0
                }}>
                  Приходите к нам — всегда рады гостям
                </p>
              </div>

              {/* Pills - Cities */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: '#4059F6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Астана
                </div>
                <div style={{
                  background: '#4059F6',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Казахстан
                </div>
              </div>

              {/* Info Cards - Vertical Layout */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Адрес */}
                <div style={{
                  padding: '24px 0',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#999999',
                    marginBottom: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Адрес
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#000000',
                    marginBottom: '6px',
                    letterSpacing: '-0.5px'
                  }}>
                    Жошы Хана 13
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#666666',
                    fontWeight: '500'
                  }}>
                    Астана, Казахстан
                  </div>
                </div>

                {/* Поддержка */}
                <div style={{
                  padding: '24px 0',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#999999',
                    marginBottom: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Поддержка
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#000000',
                    letterSpacing: '-1px',
                    lineHeight: '1'
                  }}>
                    24/7
                  </div>
                </div>

                {/* Офис */}
                <div style={{
                  padding: '24px 0',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#999999',
                    marginBottom: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Офис
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#000000',
                    letterSpacing: '-0.5px'
                  }}>
                    Пн-Пт: 10:00 - 19:00
                  </div>
                </div>
              </div>

              {/* Map */}
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                height: '300px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.234!2d71.437457!3d51.099738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDA1JzU5LjEiTiA3McKwMjYnMTQuOCJF!5e0!3m2!1sru!2skz!4v1699999999999!5m2!1sru!2skz"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
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
        @media (max-width: 768px) {
          /* Header - мобильная версия */
          .home-header-buttons { display: none !important; }
          .home-header-button-login,
          .home-header-button-register { display: none !important; }
          .home-mobile-menu-button {
            display: flex !important;
            flex-direction: column !important;
            gap: 5px !important;
          }
          
          /* Logo в хедере */
          header > div {
            padding: 16px 20px !important;
          }
          
          header > div > div:first-child {
            gap: 12px !important;
          }
          
          header > div > div:first-child > img {
            height: 35px !important;
          }
          
          header > div > div:first-child > div > div:first-child {
            font-size: 16px !important;
          }
          
          header > div > div:first-child > div > div:last-child {
            font-size: 11px !important;
          }
          
          /* Hero Section */
          .home-hero-section {
            padding-top: 120px !important;
          }
          .home-hero-container {
            grid-template-columns: 1fr !important;
            padding: 0 20px !important;
          }
          .home-hero-text-wrapper {
            display: contents;
          }
          .about-hero-main-title {
            order: 1;
            font-size: 42px !important;
          }
          .home-human-container {
            order: 2;
          }
          .about-hero-description-desktop {
            display: none !important;
          }
          .about-hero-description-mobile {
            display: block !important;
            order: 3;
            margin-bottom: 40px !important;
          }
          
          /* Story Section - мобильная */
          .home-hero-section + section {
            padding-top: 50px !important;
          }
          
          .home-hero-section + section > div > div {
            gap: 20px !important;
            margin-bottom: 20px !important;
          }
          
          .home-hero-section + section > div > div > div:last-child {
            margin-bottom: 40px !important;
          }
          
          /* Преимущества секция - мобильная */
          .advantages-section {
            padding: 50px 16px !important;
          }
          
          .advantages-header {
            text-align: center !important;
            margin-bottom: 40px !important;
            max-width: 100% !important;
          }
          
          .advantages-title {
            font-size: 32px !important;
            line-height: 1.2 !important;
            letter-spacing: -0.5px !important;
            margin-bottom: 16px !important;
          }
          
          .advantages-description {
            font-size: 16px !important;
            line-height: 1.6 !important;
            padding: 0 8px !important;
          }
          
          .advantages-grid {
            gap: 16px !important;
            grid-template-columns: 1fr !important;
          }
          
          .advantage-card {
            padding: 24px 20px !important;
            border-radius: 20px !important;
            min-height: auto !important;
          }
          
          .advantage-card h3 {
            font-size: 19px !important;
            margin-bottom: 10px !important;
            padding-bottom: 8px !important;
          }
          
          .advantage-card h3 div {
            width: 32px !important;
            height: 2px !important;
          }
          
          .advantage-card p {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
          
          .advantage-icon-wrapper {
            width: 56px !important;
            height: 56px !important;
            margin-bottom: 18px !important;
            border-radius: 14px !important;
          }
          
          .advantage-icon-wrapper img {
            width: 34px !important;
            height: 34px !important;
          }
          
          .advantage-badge {
            font-size: 9px !important;
            padding: 4px 8px !important;
            top: 12px !important;
            right: 12px !important;
            border-radius: 6px !important;
          }
          
          .advantage-card:last-child {
            margin-bottom: 40px !important;
          }
          
          /* FAQ секция - мобильная */
          .faq-section {
            padding: 50px 16px !important;
          }
          
          .faq-header {
            margin-bottom: 40px !important;
          }
          
          .faq-title {
            font-size: 32px !important;
            margin-bottom: 16px !important;
            letter-spacing: -0.5px !important;
          }
          
          .faq-description {
            font-size: 15px !important;
            line-height: 1.5 !important;
            padding: 0 8px !important;
          }
          
          .faq-list {
            gap: 12px !important;
          }
          
          .faq-item {
            border-radius: 14px !important;
          }
          
          .faq-button {
            padding: 20px 18px !important;
            gap: 16px !important;
          }
          
          .faq-question {
            font-size: 16px !important;
            line-height: 1.4 !important;
          }
          
          .faq-icon {
            min-width: 30px !important;
            height: 30px !important;
            flex-shrink: 0 !important;
          }
          
          .faq-icon span {
            font-size: 16px !important;
          }
          
          .faq-answer {
            padding: 0 18px 20px !important;
            padding-top: 20px !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
          }
          
          .faq-list {
            margin-bottom: 40px !important;
          }
          
          /* Контакты секция - мобильная */
          .contacts-section {
            padding: 60px 20px !important;
            margin-bottom: 40px !important;
          }
          
          /* Two Cards Grid - мобильная */
          .contacts-section > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .contacts-section > div > div:first-child > div {
            width: 100% !important;
          }
          
          .contacts-section > div > div:first-child > div > div:first-child {
            margin-bottom: 24px !important;
          }
          
          .contacts-section > div > div:first-child > div > div:first-child h3 {
            font-size: 28px !important;
          }
          
          .contacts-section > div > div:first-child > div > div:first-child p {
            font-size: 14px !important;
          }
          
          .contacts-header {
            margin-bottom: 40px !important;
          }
          
          .contacts-title {
            font-size: 36px !important;
            margin-bottom: 16px !important;
            letter-spacing: -1px !important;
          }
          
          .contacts-description {
            font-size: 16px !important;
            line-height: 1.5 !important;
            padding: 0 !important;
          }
          
          .contacts-grid {
            display: flex !important;
            grid-template-columns: none !important;
            gap: 16px !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 0 20px !important;
            margin: 0 -20px !important;
          }
          
          .contacts-grid::-webkit-scrollbar {
            display: none !important;
          }
          
          .contact-card {
            min-width: 280px !important;
            max-width: 280px !important;
            flex-shrink: 0 !important;
            padding: 36px 28px !important;
            border-radius: 24px !important;
            scroll-snap-align: start !important;
          }
          
          .contact-icon {
            width: 64px !important;
            height: 64px !important;
            margin-bottom: 20px !important;
            border-radius: 16px !important;
          }
          
          .contact-icon img {
            width: 32px !important;
            height: 32px !important;
          }
          
          .contact-title {
            font-size: 20px !important;
            margin-bottom: 10px !important;
          }
          
          .contact-value {
            font-size: 16px !important;
          }
          
          /* Office Card - мобильная */
          .office-card {
            padding: 40px 24px !important;
            border-radius: 24px !important;
          }
          
          .office-title {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
          
          .office-subtitle {
            font-size: 15px !important;
          }
          
          /* City pills в одну колонку */
          .office-card > div:nth-child(2) {
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          
          .office-card > div:nth-child(2) > div {
            padding: 14px 24px !important;
            font-size: 16px !important;
            width: 100% !important;
            text-align: center !important;
          }
          
          /* Info cards в одну колонку */
          .office-card > div:nth-child(3) {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          
          .office-card > div:nth-child(3) > div {
            padding: 24px 20px !important;
            border-radius: 16px !important;
          }
          
          .office-card > div:nth-child(3) > div > div:nth-child(2) {
            font-size: 32px !important;
          }
          
          /* Features list */
          .office-card > div:nth-child(4) {
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          
          .office-card > div:nth-child(4) > div {
            padding: 14px !important;
            border-radius: 10px !important;
          }
          
          .office-card > div:nth-child(4) > div > div:last-child {
            font-size: 14px !important;
          }
          
          /* Map */
          .office-map {
            height: 300px !important;
            border-radius: 16px !important;
          }
          
          .office-info-cards > div:first-child > div:first-child {
            font-size: 10px !important;
            margin-bottom: 10px !important;
          }
          
          .office-info-cards > div:first-child > div:nth-child(2) {
            font-size: 16px !important;
          }
          
          .office-info-cards > div:first-child > div:last-child {
            font-size: 14px !important;
          }
          
          .office-info-cards > div:last-child {
            gap: 12px !important;
          }
          
          .office-info-cards > div:last-child > div {
            padding: 16px !important;
            border-radius: 12px !important;
          }
          
          .office-info-cards > div:last-child > div > div:first-child {
            font-size: 10px !important;
            margin-bottom: 6px !important;
          }
          
          .office-info-cards > div:last-child > div:nth-child(1) > div:last-child {
            font-size: 20px !important;
          }
          
          .office-info-cards > div:last-child > div:nth-child(2) > div:last-child {
            font-size: 15px !important;
          }
          
          .office-map {
            min-height: 250px !important;
            height: 250px !important;
            max-width: 100% !important;
            border-radius: 14px !important;
          }
        }

        @media (max-width: 900px) {
          section > div > div[style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 600px) {
          section > div > div[style*="gridTemplateColumns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .home-hero-section {
            padding-top: 100px !important;
            padding-bottom: 50px !important;
          }

          .home-hero-container {
            padding: 0 16px !important;
          }

          .about-hero-main-title {
            font-size: 32px !important;
            letter-spacing: -1px !important;
            margin-bottom: 20px !important;
          }

          .about-hero-description-mobile {
            font-size: 16px !important;
          }
          
          /* Преимущества - маленькие экраны */
          .advantages-section {
            padding: 40px 16px !important;
          }
          
          .advantages-title {
            font-size: 28px !important;
            margin-bottom: 14px !important;
          }
          
          .advantages-description {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
          
          .advantage-card {
            padding: 20px 18px !important;
            border-radius: 18px !important;
          }
          
          .advantage-card h3 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          
          .advantage-card p {
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          
          .advantage-icon-wrapper {
            width: 52px !important;
            height: 52px !important;
            margin-bottom: 16px !important;
            border-radius: 12px !important;
          }
          
          .advantage-icon-wrapper img {
            width: 32px !important;
            height: 32px !important;
          }
          
          .advantage-badge {
            font-size: 8px !important;
            padding: 3px 7px !important;
            top: 10px !important;
            right: 10px !important;
          }
          
          /* FAQ - маленькие экраны */
          .faq-section {
            padding: 40px 16px !important;
          }
          
          .faq-title {
            font-size: 28px !important;
          }
          
          .faq-description {
            font-size: 14px !important;
          }
          
          .faq-button {
            padding: 18px 16px !important;
            gap: 12px !important;
          }
          
          .faq-question {
            font-size: 15px !important;
          }
          
          .faq-icon {
            min-width: 28px !important;
            height: 28px !important;
          }
          
          .faq-icon span {
            font-size: 15px !important;
          }
          
          .faq-answer {
            padding: 0 16px 18px !important;
            padding-top: 18px !important;
            font-size: 13px !important;
          }
          
          /* Контакты - маленькие экраны */
          .contacts-section {
            padding: 40px 16px !important;
          }
          
          .contacts-title {
            font-size: 28px !important;
          }
          
          .contacts-description {
            font-size: 14px !important;
          }
          
          .contact-card {
            padding: 28px 20px !important;
            border-radius: 18px !important;
          }
          
          .contact-icon {
            width: 60px !important;
            height: 60px !important;
            margin-bottom: 18px !important;
            border-radius: 14px !important;
          }
          
          .contact-icon img {
            width: 30px !important;
            height: 30px !important;
          }
          
          .contact-title {
            font-size: 19px !important;
          }
          
          .contact-value {
            font-size: 15px !important;
          }
          
          .office-card {
            padding: 28px 18px !important;
            border-radius: 18px !important;
          }
          
          .office-title {
            font-size: 22px !important;
          }
          
          .office-subtitle {
            font-size: 13px !important;
          }
          
          .office-content {
            gap: 18px !important;
          }
          
          .office-info-cards > div:first-child {
            padding: 18px !important;
          }
          
          .office-info-cards > div:first-child > div:nth-child(2) {
            font-size: 15px !important;
          }
          
          .office-info-cards > div:first-child > div:last-child {
            font-size: 13px !important;
          }
          
          .office-info-cards > div:last-child > div {
            padding: 14px !important;
          }
          
          .office-info-cards > div:last-child > div:nth-child(1) > div:last-child {
            font-size: 18px !important;
          }
          
          .office-info-cards > div:last-child > div:nth-child(2) > div:last-child {
            font-size: 14px !important;
          }
          
          .office-map {
            min-height: 220px !important;
            height: 220px !important;
          }
          
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
