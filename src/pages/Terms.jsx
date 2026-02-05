import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../pages/Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'
import qaraaCrmLogo from '../images/qaraaxqaraa-crm.png'

export default function Terms() {
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
            Пользовательское соглашение
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
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
                «qaraa.asia» (qaraa.kz) (далее — «Компания») и пользователями сервиса qaraa.asia (qaraa.kz) (далее — «Пользователь»).
                Используя сервис, вы принимаете условия данного Соглашения в полном объёме.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                2. Регистрация и учётная запись
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Для использования сервиса необходимо:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Пройти регистрацию, указав корректные данные</li>
                <li>Подтвердить номер телефона</li>
                <li>Создать надёжный пароль и хранить его в тайне</li>
              </ul>
              <p style={{ color: '#666666', marginTop: '16px' }}>
                Вы несёте ответственность за все действия, совершённые с вашей учётной записи.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                3. Бонусная программа
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Условия бонусной программы:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Кэшбэк 5% начисляется на каждую покупку</li>
                <li>Бонусы действуют 12 месяцев с момента начисления</li>
                <li>Бонусами можно оплатить до 50% суммы заказа</li>
                <li>Минимальная сумма для использования бонусов — 100 ₸</li>
                <li>При возврате товара бонусы аннулируются</li>
                <li>Бонусы не подлежат обмену на деньги</li>
              </ul>
              <p style={{ color: '#666666', marginTop: '16px' }}>
                Компания оставляет за собой право изменить условия бонусной программы с уведомлением
                пользователей за 30 дней.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                4. Заказы и оплата
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                При оформлении заказа:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Вы подтверждаете корректность указанных данных</li>
                <li>Цена фиксируется на момент оформления заказа</li>
                <li>Оплата производится одним из доступных способов</li>
                <li>Мы оставляем за собой право отменить заказ при подозрении на мошенничество</li>
                <li>При оплате бонусами остаток оплачивается одним из способов оплаты</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                5. Доставка
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Условия доставки:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Доставка по Астане: 1-2 дня</li>
                <li>Доставка по Казахстану: 3-7 дней</li>
                <li>Сроки доставки могут увеличиться в праздничные дни</li>
                <li>Вы обязаны принять заказ в течение 3 дней с момента прибытия</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                6. Запрещённые действия
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Пользователю запрещается:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Использовать сервис в незаконных целях</li>
                <li>Пытаться получить несанкционированный доступ к системе</li>
                <li>Передавать свою учётную запись третьим лицам</li>
                <li>Использовать автоматизированные средства для доступа к сервису</li>
                <li>Размещать вредоносное ПО или спам</li>
                <li>Злоупотреблять бонусной программой или совершать мошеннические действия</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                7. Ответственность
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Компания:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Не несёт ответственности за убытки, возникшие из-за неправильного использования сервиса</li>
                <li>Не гарантирует бесперебойную работу сайта (возможны технические работы)</li>
                <li>Не несёт ответственности за задержки доставки по вине курьерской службы</li>
                <li>Не отвечает за действия третьих лиц (платёжные системы, банки)</li>
              </ul>
              <p style={{ color: '#666666', marginTop: '16px' }}>
                Максимальная ответственность Компании ограничена суммой вашего заказа.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                8. Изменение условий
              </h2>
              <p style={{ color: '#666666' }}>
                Компания оставляет за собой право изменить условия Соглашения в любое время.
                Продолжая пользоваться сервисом после
                изменений, вы соглашаетесь с новыми условиями.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                9. Возврат и обмен
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Условия возврата товара:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Возврат возможен в течение 14 дней с момента получения</li>
                <li>Товар должен быть в оригинальной упаковке и без следов использования</li>
                <li>При возврате бонусы, потраченные на покупку, аннулируются</li>
                <li>Возврат денежных средств осуществляется в течение 5-10 рабочих дней</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                10. Права компании
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Компания имеет право:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Приостанавливать доступ к сайту для технических работ</li>
                <li>Изменять или ограничивать функционал сервиса</li>
                <li>Блокировать или удалять учётные записи при нарушении условий Соглашения</li>
                <li>Отказывать в обслуживании при выявлении злоупотреблений или недобросовестного поведения</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                11. Права пользователя
              </h2>
              <p style={{ color: '#666666', marginBottom: '16px' }}>
                Пользователь имеет право:
              </p>
              <ul style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Получать достоверную информацию о товарах, ценах и условиях доставки</li>
                <li>Использовать накопленные бонусы согласно правилам</li>
                <li>Обращаться в поддержку для решения спорных ситуаций</li>
                <li>Требовать удаления аккаунта или данных при завершении использования сервиса</li>
              </ul>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                12. Применимое право и разрешение споров
              </h2>
              <p style={{ color: '#666666' }}>
                Все споры и разногласия между Пользователем и Компанией разрешаются путём переговоров.
                В случае невозможности мирного урегулирования спор передаётся на рассмотрение суда по месту
                регистрации Компании в соответствии с законодательством Республики Казахстан.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                13. Правила использования сайта
              </h2>
              <p style={{ color: '#666666' }}>
                Пользователь обязуется использовать сайт исключительно для личных, некоммерческих целей —
                для просмотра товаров, оформления заказов и участия в бонусной программе.
                Запрещено использовать сайт для распространения рекламы, сбора данных или иной деятельности,
                не связанной с покупками.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                14. Обновления сервиса
              </h2>
              <p style={{ color: '#666666' }}>
                Компания регулярно вносит улучшения и обновления в работу сайта. Мы можем временно ограничивать
                доступ к отдельным функциям без предварительного уведомления пользователей.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                15. Временная приостановка аккаунта
              </h2>
              <p style={{ color: '#666666' }}>
                Компания может временно приостановить доступ пользователя к сервису при подозрении на нарушение
                правил, до выяснения обстоятельств. После проверки доступ может быть восстановлен.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                16. Информационные материалы
              </h2>
              <p style={{ color: '#666666' }}>
                Компания может публиковать на сайте новости, советы по стилю, подборки товаров и иные
                информационные материалы. Пользователь может свободно их просматривать, но не имеет права
                копировать или использовать в коммерческих целях.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                17. Ответственность за корректность данных
              </h2>
              <p style={{ color: '#666666' }}>
                Пользователь несёт ответственность за правильность указанных при регистрации данных, включая
                номер телефона, адрес и контактную информацию. Ошибки в данных могут привести к задержке
                доставки или отмене заказа.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                18. Изменение ассортимента
              </h2>
              <p style={{ color: '#666666' }}>
                Компания вправе изменять ассортимент, характеристики и стоимость товаров без предварительного
                уведомления. Товары, представленные на сайте, могут отличаться от изображений по цвету,
                упаковке или незначительным деталям.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                19. Отложенные заказы
              </h2>
              <p style={{ color: '#666666' }}>
                В случае временного отсутствия товара компания может предложить пользователю дождаться
                поступления или заменить товар аналогом. Пользователь имеет право отказаться от ожидания
                и получить полный возврат средств.
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
                По вопросам, связанным с Соглашением, обращайтесь:
              </p>
              <ul className="privacy-contacts-list" style={{ color: '#666666', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Telegram: @sssssrkd</li>
                <li>WhatsApp: +7 777 888 30 07</li>
                <li className="privacy-last-contact">Адрес: Астана, Казахстан</li>
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
