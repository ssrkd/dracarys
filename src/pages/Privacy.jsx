import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../pages/Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'

export default function Privacy() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'qaraa.asia'
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

      {/* Content */}
      <section className="privacy-content-section" style={{
        paddingTop: '100px',
        paddingBottom: '120px',
        background: '#FFFFFF'
      }}>
        <div className="privacy-content-container" style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 48px'
        }}>
          <h1 style={{
            fontSize: '64px',
            fontWeight: '600',
            lineHeight: '1.1',
            marginBottom: '16px',
            color: '#000000',
            letterSpacing: '-2px'
          }}>
            Политика конфиденциальности
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#999999',
            marginBottom: '64px'
          }}>
            Последнее обновление: 13 ноября 2025 г.
          </p>

          <div style={{
            fontSize: '18px',
            color: '#000000',
            lineHeight: '1.8',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}>
            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                1. Общие положения
              </h2>
              <p style={{ color: '#666666' }}>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса qaraa.asia (qaraa.kz) (далее — «Сервис»). Используя Сервис, вы соглашаетесь с условиями данной Политики.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                2. Какие данные мы собираем
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Мы собираем следующие категории персональных данных:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><strong>Контактные данные:</strong> имя, номер телефона, email</li>
                <li><strong>Данные о покупках:</strong> история транзакций, сумма покупок, накопленные бонусы</li>
                <li><strong>Технические данные:</strong> IP-адрес, тип устройства, браузер</li>
                <li><strong>Данные карты:</strong> номер бонусной карты, баланс бонусов</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                3. Как мы используем данные
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Ваши данные используются для:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Обработки заказов и начисления бонусов</li>
                <li>Связи с вами по вопросам заказов и поддержки</li>
                <li>Улучшения качества сервиса и персонализации</li>
                <li>Отправки уведомлений о статусе заказа и акциях (с вашего согласия)</li>
                <li>Анализа статистики и улучшения работы системы</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                4. Защита данных
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Мы применяем современные меры безопасности для защиты ваших данных:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Шифрование данных в базе данных</li>
                <li>Двухфакторная аутентификация для доступа к системе</li>
                <li>Регулярный аудит безопасности</li>
                <li>Ограниченный доступ сотрудников к персональным данным</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                5. Передача данных третьим лицам
              </h2>
              <p style={{ color: '#666666' }}>
                Мы <strong>не продаём и не передаём</strong> ваши персональные данные третьим лицам в коммерческих целях.
                Данные могут быть переданы только:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <li>Курьерским службам для доставки заказов</li>
                <li>Платёжным системам для обработки платежей</li>
                <li>Государственным органам по официальному запросу</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                6. Ваши права
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Вы имеете право:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Исправить неточные данные</li>
                <li>Удалить свой аккаунт и все связанные данные</li>
                <li>Отозвать согласие на обработку данных</li>
                <li>Отписаться от рассылок</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                7. Cookies и аналитика
              </h2>
              <p style={{ color: '#666666' }}>
                Мы используем cookies для улучшения работы сайта и анализа трафика.
                Вы можете отключить cookies в настройках браузера, но это может ограничить функциональность сайта.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                8. Хранение данных
              </h2>
              <p style={{ color: '#666666' }}>
                Мы храним ваши данные до тех пор, пока:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <li>Вы пользуетесь нашим сервисом</li>
                <li>Это необходимо для выполнения обязательств перед вами</li>
                <li>Это требуется по закону (например, для налоговой отчётности)</li>
              </ul>
              <p style={{ color: '#666666', marginTop: '16px' }}>
                После удаления аккаунта данные удаляются в течение 30 дней, за исключением тех,
                которые мы обязаны хранить по закону.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                9. Изменения в Политике
              </h2>
              <p style={{ color: '#666666' }}>
                Мы можем обновлять эту Политику конфиденциальности. Дата последнего обновления указана в начале документа.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                10. Обработка платежных данных
              </h2>
              <p style={{ color: '#666666' }}>
                Мы не храним данные банковских карт. Все операции проводятся через защищённые платёжные шлюзы, которые соответствуют стандарту безопасности PCI DSS.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                11. Социальные сети и сторонние сервисы
              </h2>
              <p style={{ color: '#666666' }}>
                Наш сайт может содержать ссылки на социальные сети (Instagram, Telegram и др.) и сторонние сайты. Мы не несем ответственности за их политику конфиденциальности. Рекомендуем ознакомиться с условиями этих сайтов отдельно.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                12. Соответствие законодательству
              </h2>
              <p style={{ color: '#666666' }}>
                Настоящая Политика составлена в соответствии с законодательством Республики Казахстан, включая Закон «О персональных данных и их защите».
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                13. Ответственность пользователя
              </h2>
              <p style={{ color: '#666666' }}>
                Пользователь обязуется предоставлять только достоверные данные. В случае указания ложных данных Сервис не несёт ответственности за невозможность связи или предоставления услуг.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                14. Отзывы и пользовательский контент
              </h2>
              <p style={{ color: '#666666' }}>
                Пользователи могут оставлять отзывы о товарах и сервисе. Размещая отзыв, вы даёте согласие на его публикацию на сайте и в социальных сетях магазина. Мы оставляем за собой право редактировать или удалять отзывы, нарушающие правила приличия, содержащие ненормативную лексику или ложную информацию.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                15. Ответственность за утечку по вине пользователя
              </h2>
              <p style={{ color: '#666666' }}>
                Мы принимаем все разумные меры для защиты ваших данных. Однако если доступ к вашему аккаунту был получен из-за передачи пароля третьим лицам или использования ненадёжного устройства, ответственность несёт пользователь.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                16. Обработка данных при оформлении заказа от имени другого лица
              </h2>
              <p style={{ color: '#666666' }}>
                Если вы оформляете заказ на другого человека (например, в подарок), вы подтверждаете, что получили его согласие на передачу необходимых персональных данных (имя, адрес, телефон) для доставки.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                17. Контроль со стороны государственных органов
              </h2>
              <p style={{ color: '#666666' }}>
                Мы соблюдаем требования уполномоченных органов Республики Казахстан, включая Комитет по защите прав потребителей и Комитет национальной безопасности, в части предоставления данных по законным основаниям.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                18. Отказ от ответственности за внешние сбои
              </h2>
              <p style={{ color: '#666666' }}>
                Мы не несём ответственности за временные сбои в работе сайта, вызванные техническими проблемами хостинга, интернет-провайдеров или сторонних сервисов, однако делаем всё возможное для их оперативного устранения.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                19. Обратная связь по улучшению политики
              </h2>
              <p style={{ color: '#666666' }}>
                Мы открыты к предложениям по улучшению Политики конфиденциальности. Если вы считаете, что какой-то пункт нарушает ваши права — свяжитесь с нами, и мы рассмотрим вопрос в индивидуальном порядке.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                20. Контакты
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Если у вас есть вопросы по Политике конфиденциальности, свяжитесь с нами:
              </p>
              <ul className="privacy-contacts-list" style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Telegram: @sssssrkd</li>
                <li className="privacy-last-contact">WhatsApp: +7 777 888 30 07</li>
              </ul>
            </section>
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
    </div>
  )
}
