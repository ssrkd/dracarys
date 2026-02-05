import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { gradients } from '../theme'
import { useLang } from '../context/LangContext'
import { supabase } from '../supabaseClient'
import qaraaLogo from '../images/qaraalogo.png'
import qaraaCoffee from '../images/qaraacoffee.png'

// Premium components
import DynamicHeader from '../components/DynamicHeader'
import FloatingNav from '../components/FloatingNav'
import InteractiveCard from '../components/InteractiveCard'
import DigitalCard from '../components/DigitalCard'
import LocationsView from '../components/LocationsView'
import ChatGuideView from '../components/ChatGuideView'
import Profile from './Profile'

function DashboardContent() {
    usePageTitle('')
    const navigate = useNavigate()
    const { theme, isDark } = useTheme()
    const { t, setLang, lang } = useLang()

    const [customer, setCustomer] = useState(null)
    const [activeTab, setActiveTab] = useState('home')
    const [showCoffeeAlert, setShowCoffeeAlert] = useState(false)

    useEffect(() => {
        // Усиленный скролл вверх при монтировании
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0

        const timer = setTimeout(() => {
            window.scrollTo(0, 0)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                const raw = localStorage.getItem('qaraa_customer')
                if (raw) {
                    const localData = JSON.parse(raw)

                    // Сначала показываем локальные данные для быстрой загрузки
                    setCustomer(localData)

                    // Затем синхронизируем с базой данных для получения актуальных бонусов
                    const { data: freshData, error } = await supabase
                        .from('customers')
                        .select('*')
                        .eq('id', localData.id)
                        .maybeSingle()

                    if (!error && freshData) {
                        // Обновляем состояние и localStorage актуальными данными
                        setCustomer(freshData)
                        localStorage.setItem('qaraa_customer', JSON.stringify(freshData))
                    }
                } else {
                    navigate('/login')
                }
            } catch (e) {
                console.error('Error loading customer:', e)
                navigate('/login')
            }
        }

        loadCustomer()

        // Poll for updates every 5 seconds for real-time data
        const interval = setInterval(loadCustomer, 5000)
        return () => clearInterval(interval)
    }, [navigate])

    // Scroll to top when changing tabs and update tracking
    useEffect(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0

        // Update global variable for UserTracker
        const tabNames = {
            'home': 'Главная (App)',
            'qr': 'QR Карта',
            'locations': 'Локации',
            'chat': 'Чат Guide',
            'profile': 'Профиль'
        }
        window.qaraaCurrentPage = tabNames[activeTab] || `Dashboard (${activeTab})`

        // Force immediate update if UserTracker is listening? 
        // UserTracker heartbeat is 15s. We can manually trigger an update here too for instant feedback.
        if (customer?.id) {
            supabase.from('customers').update({
                current_page: window.qaraaCurrentPage,
                last_active: new Date(),
                is_online: true
            }).eq('id', customer.id).then(() => { })
        }

    }, [activeTab, customer?.id])

    if (!customer) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: isDark ? '#000000' : '#FFFFFF'
            }}>
                <div style={{
                    fontSize: '48px',
                    animation: 'spin 1s linear infinite'
                }}>
                    ⏳
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div style={{
                        padding: '20px',
                        paddingBottom: '100px',
                        background: 'linear-gradient(180deg, #F0F4FF 0%, #F9F9F9 100%)',
                        minHeight: 'calc(100vh - 200px)'
                    }}>
                        {/* Section Title */}
                        <div style={{
                            marginBottom: '16px',
                            paddingLeft: '4px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                margin: '0 0 4px 0',
                                letterSpacing: '-0.5px'
                            }}>
                                {t('programs.title')}
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: '#8E8E93',
                                margin: 0,
                                fontWeight: '500'
                            }}>
                                {t('programs.subtitle')}
                            </p>
                        </div>

                        {/* News Highlights (Stories Style) */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            overflowX: 'auto',
                            padding: '4px 4px 20px 4px',
                            margin: '0 -4px 16px',
                            MsOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {[
                                { id: 1, label: 'Store', icon: '🛍️', bg: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' },
                                { id: 2, label: 'Coffee', icon: '☕', bg: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)' },
                                { id: 3, label: 'Sale', icon: '🔥', bg: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
                                { id: 4, label: 'New', icon: '✨', bg: 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)' },
                                { id: 5, label: 'Qaraa', icon: '🚀', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
                            ].map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate('/news')}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flexShrink: 0,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: isDark ? '#000000' : '#FFFFFF',
                                        padding: '3px',
                                        border: '2px solid #007AFF',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            background: item.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px'
                                        }}>
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#3A3A3C'
                                    }}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Premium Business Cards with Glassmorphism */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {/* Store Card */}
                            <div
                                onClick={() => navigate('/storedashboard')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                                onTouchStart={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.98) translateY(2px)'
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'
                                }}
                                onTouchEnd={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                {/* Gradient overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '150px',
                                    height: '150px',
                                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                        gap: '16px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'transparent',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            padding: '0',
                                            marginLeft: '-4px'
                                        }}>
                                            <img
                                                src={qaraaLogo}
                                                alt="qaraa store"
                                                style={{
                                                    width: '100%',
                                                    height: '1000%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            padding: '6px 12px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: '#f59e0b',
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                            marginLeft: 'auto'
                                        }}>
                                            {t('home.store.badge')}
                                        </div>
                                    </div>

                                    <h3 style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        margin: '0 0 8px 0',
                                        letterSpacing: '-0.5px',
                                        lineHeight: 1.2
                                    }}>
                                        {t('home.store.title')}
                                    </h3>

                                    <p style={{
                                        fontSize: '15px',
                                        color: '#f59e0b',
                                        margin: '0 0 6px 0',
                                        fontWeight: '600',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {t('home.store.subtitle')}
                                    </p>

                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6B7280',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.5
                                    }}>
                                        {t('home.store.description')}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: '#f59e0b'
                                    }}>
                                        <span>{t('common.open')}</span>
                                        <span style={{
                                            fontSize: '20px',
                                            transform: 'translateX(0)',
                                            transition: 'transform 0.3s ease'
                                        }}>→</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coffee Card */}
                            <div
                                onClick={() => setShowCoffeeAlert(true)}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                                onTouchStart={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.98) translateY(2px)'
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'
                                }}
                                onTouchEnd={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                {/* Gradient overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '150px',
                                    height: '150px',
                                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'transparent',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            padding: '0',
                                            marginLeft: '-4px'
                                        }}>
                                            <img
                                                src={qaraaCoffee}
                                                alt="qaraa coffee"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            padding: '6px 12px',
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: '#667eea',
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {t('home.coffee.badge')}
                                        </div>
                                    </div>

                                    <h3 style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        margin: '0 0 8px 0',
                                        letterSpacing: '-0.5px',
                                        lineHeight: 1.2
                                    }}>
                                        {t('home.coffee.title')}
                                    </h3>

                                    <p style={{
                                        fontSize: '15px',
                                        color: '#667eea',
                                        margin: '0 0 6px 0',
                                        fontWeight: '600',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {t('home.coffee.subtitle')}
                                    </p>

                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6B7280',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.5
                                    }}>
                                        {t('home.coffee.description')}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: '#667eea'
                                    }}>
                                        <span>{t('common.open')}</span>
                                        <span style={{
                                            fontSize: '20px',
                                            transform: 'translateX(0)',
                                            transition: 'transform 0.3s ease'
                                        }}>→</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )

            case 'qr':
                return customer ? (
                    <DigitalCard
                        customerId={customer.id}
                        cardNumber={customer.card_number}
                        bonusBalance={customer.bonus_balance || 0}
                        userName={customer.first_name || t('home.user')}
                    />
                ) : null

            case 'locations':
                return <LocationsView />

            case 'chat':
                return <ChatGuideView />

            case 'profile':
                return (
                    <Profile
                        customer={customer}
                        onLogout={async () => {
                            try {
                                if (customer?.id) {
                                    await supabase
                                        .from('customers')
                                        .update({ is_online: false, last_active: new Date().toISOString() })
                                        .eq('id', customer.id)
                                }
                                localStorage.removeItem('qaraa_customer')
                            } catch (_) { }
                            // Force reload to clear App state immediately
                            window.location.href = '/'
                        }}
                        hideHeader={true}
                    />
                )

            default:
                return null
        }
    }

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
        }
        body { background: #F9F9F9; }
      `}</style>

            <div style={{
                minHeight: '100vh',
                background: '#F9F9F9',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}>
                <DynamicHeader
                    userName={customer?.first_name || t('home.user')}
                    avatarUrl={customer?.avatar_url}
                    bonusBalance={customer?.bonus_balance || 0}
                    onAvatarClick={() => setActiveTab('profile')}
                />

                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {renderTabContent()}
                </div>

                <FloatingNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Premium Coffee Alert Modal */}
            {showCoffeeAlert && (
                <div
                    onClick={() => setShowCoffeeAlert(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(15px)',
                        WebkitBackdropFilter: 'blur(15px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        animation: 'fadeIn 0.3s ease'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '28px',
                            width: '100%',
                            maxWidth: '340px',
                            padding: '32px 24px',
                            textAlign: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            animation: 'slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <div style={{
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                        }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3 style={{
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#1a1a1a',
                            marginBottom: '12px',
                            letterSpacing: '-0.5px'
                        }}>
                            {t('home.coffee.title')}
                        </h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6B7280',
                            lineHeight: 1.5,
                            marginBottom: '28px',
                            fontWeight: '500'
                        }}>
                            {t('home.coffee.closed_msg')}
                        </p>
                        <button
                            onClick={() => setShowCoffeeAlert(false)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 8px 16px rgba(255, 59, 48, 0.2)'
                            }}
                            onTouchStart={(e) => e.target.style.transform = 'scale(0.97)'}
                            onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translateY(40px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    )
}

export default function DashboardMobile() {
    return (
        <ThemeProvider>
            <DashboardContent />
        </ThemeProvider>
    )
}
