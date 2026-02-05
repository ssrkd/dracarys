import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function News({ customer }) {
  usePageTitle('Новости')
  const navigate = useNavigate()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    try { localStorage.removeItem('qaraa_customer') } catch (_) {}
    try {
      window.location.href = '/'
    } catch (_) {
      navigate('/')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes pulse { 
          0%, 100% { opacity: 0.4; transform: scale(1); } 
          50% { opacity: 1; transform: scale(1.2); } 
        }
        
        @media (max-width: 768px) {
          .home-header-container { padding: 16px 20px !important; }
          .home-logo { height: 36px !important; }
          .home-logo-title { font-size: 15px !important; }
          .home-logo-subtitle { font-size: 11px !important; }
          .news-content { 
            padding: 100px 20px 80px !important; 
            min-height: calc(100vh - 180px) !important;
          }
          .news-content div:first-of-type { font-size: 80px !important; }
          .news-content div:nth-of-type(2) { font-size: 32px !important; }
          .news-content div:nth-of-type(3) { font-size: 18px !important; }
          .news-content div:nth-of-type(4) { font-size: 16px !important; }
        }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        {/* Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease'
        }}>
          <div className="home-header-container" style={{
            maxWidth: '1440px', margin: '0 auto', padding: '20px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div className="home-logo-container" style={{
              display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
              transition: 'opacity 0.3s ease', opacity: 1
            }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <img src={logoQaraa} alt="qaraa" className="home-logo" 
                style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div className="home-logo-title" style={{
                  fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: '1'
                }}>qaraa.kz</div>
                <div className="home-logo-subtitle" style={{
                  fontSize: '12px', color: '#8E8E93', marginTop: '4px'
                }}>Безопасная экосистема</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="Меню"
                className="mobile-profile-btn"
                style={{
                  width: '44px', height: '44px', background: 'transparent', border: 'none',
                  borderRadius: '50%', fontSize: '24px', color: '#1D1D1F', cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', letterSpacing: '2px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
                onTouchStart={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'scale(0.95)' }}
                onTouchEnd={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
                ⋯
              </button>
              
              {profileMenuOpen && (
                <div
                  onMouseLeave={() => setProfileMenuOpen(false)}
                  className="mobile-profile-menu"
                  style={{
                    position: 'absolute', top: '52px', right: 0, background: '#FFFFFF',
                    border: '1px solid #E5E5EA', borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', minWidth: '180px',
                    padding: '8px 0', zIndex: 1000, WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/profile') }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'transparent', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, 
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Профиль
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/history') }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'transparent', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, 
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Мои заказы
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/cart') }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'transparent', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, 
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Корзина
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/track') }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'transparent', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, 
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Отследить заказ
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/news') }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'rgba(0, 122, 255, 0.1)', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, 
                      color: '#007AFF', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    Новости
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { 
                      setProfileMenuOpen(false)
                      setShowLogoutConfirm(true)
                    }}
                    style={{ 
                      width: '100%', padding: '12px 14px', background: 'transparent', 
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 700, 
                      cursor: 'pointer', color: '#FF3B30', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onTouchStart={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onTouchEnd={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="news-content" style={{
          paddingTop: '120px', padding: '120px 48px 80px', maxWidth: '800px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)', textAlign: 'center'
        }}>
          {/* Анимированная иконка */}
          <div style={{
            fontSize: '120px', marginBottom: '32px', animation: 'fadeIn 1s ease',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🚀
          </div>

          {/* Заголовок */}
          <div style={{
            fontSize: '48px', fontWeight: '800', color: '#1D1D1F', marginBottom: '16px',
            letterSpacing: '-1px', animation: 'slideUp 0.8s ease 0.2s backwards'
          }}>
            В разработке
          </div>

          {/* Подзаголовок */}
          <div style={{
            fontSize: '24px', fontWeight: '600', color: '#86868B', marginBottom: '32px',
            animation: 'slideUp 0.8s ease 0.4s backwards'
          }}>
            скоро.....
          </div>

          {/* Описание */}
          <div style={{
            fontSize: '18px', color: '#1D1D1F', lineHeight: 1.6, maxWidth: '500px',
            marginBottom: '48px', animation: 'slideUp 0.8s ease 0.6s backwards'
          }}>
            Мы работаем над созданием удивительного раздела новостей. 
            Здесь вы сможете узнавать о последних обновлениях, акциях и событиях qaraa.kz
          </div>

          {/* Декоративные элементы */}
          <div style={{
            display: 'flex', gap: '20px', marginBottom: '32px',
            animation: 'fadeIn 1s ease 0.8s backwards'
          }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              animation: 'pulse 2s infinite 0.2s'
            }}></div>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              animation: 'pulse 2s infinite 0.4s'
            }}></div>
          </div>

        </div>

        {/* Logout confirmation modal */}
        {showLogoutConfirm && (
          <div
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '20px', zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF', borderRadius: '20px', padding: '24px',
                maxWidth: '340px', width: '100%', animation: 'slideUp 0.3s ease-out'
              }}
            >
              <div style={{
                fontSize: '20px', fontWeight: '700', color: '#000000',
                marginBottom: '12px', textAlign: 'center'
              }}>
                Выйти из аккаунта?
              </div>
              <div style={{
                fontSize: '14px', color: '#8E8E93', marginBottom: '24px',
                textAlign: 'center', lineHeight: '1.5'
              }}>
                Вы уверены, что хотите выйти? Вам придется снова войти в систему.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '14px', background: '#F2F2F7', color: '#000000',
                    fontSize: '16px', fontWeight: '600', borderRadius: '12px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '14px', background: '#FF3B30', color: '#FFFFFF',
                    fontSize: '16px', fontWeight: '600', borderRadius: '12px',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
