import React from 'react'
import { useTheme } from '../context/ThemeContext'
import dashglavnaya from '../images/dashglavnaya.png'
import dashcard from '../images/dashcard.png'
import dashmesto from '../images/dashmesto.png'
import dashgid from '../images/dashgid.png'
import dashprofile from '../images/dashprofile.png'
import { useLang } from '../context/LangContext'

export default function FloatingNav({ activeTab, onTabChange }) {
    const { theme, isDark } = useTheme()
    const { t } = useLang()

    const tabs = [
        { id: 'home', label: t('nav.home'), icon: dashglavnaya },
        { id: 'locations', label: t('nav.locations'), icon: dashmesto },
        { id: 'qr', label: t('nav.qr'), icon: dashcard },
        // { id: 'chat', label: t('nav.chat'), icon: dashgid },
        { id: 'profile', label: t('nav.profile'), icon: dashprofile }
    ]

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'rgba(249, 249, 249, 0.92)',
            backdropFilter: 'saturate(180%) blur(30px)',
            WebkitBackdropFilter: 'saturate(180%) blur(30px)',
            borderTop: '0.5px solid rgba(0, 0, 0, 0.08)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '10px 0 6px',
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 0',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            onTouchStart={(e) => {
                                e.currentTarget.style.transform = 'scale(0.88)'
                            }}
                            onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '26px',
                                height: '26px',
                                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.35)',
                                transition: 'filter 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)'
                            }}>
                                <img
                                    src={tab.icon}
                                    alt={tab.label}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <span style={{
                                fontSize: '11px',
                                fontWeight: isActive ? '600' : '500',
                                color: isActive ? '#007AFF' : '#8E8E93',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                letterSpacing: '-0.1px'
                            }}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
