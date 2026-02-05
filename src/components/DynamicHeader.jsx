import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import dashprivet from '../images/dashprivet.png'

export default function DynamicHeader({ userName, avatarUrl, onAvatarClick, bonusBalance = 0 }) {
    const { theme, isDark } = useTheme()
    const { t } = useLang()

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) return t('greet.morning')
        if (hour >= 12 && hour < 18) return t('greet.day')
        if (hour >= 18 && hour < 22) return t('greet.evening')
        return t('greet.night')
    }

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Greeting with icon and name */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        margin: 0,
                        color: '#000000',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-0.6px',
                        lineHeight: 1
                    }}>
                        {getGreeting()}, {userName}
                    </h1>
                    <img
                        src={dashprivet}
                        alt="Привет"
                        style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* Avatar */}
                <button
                    onClick={onAvatarClick}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: 'none',
                        background: avatarUrl
                            ? `url(${avatarUrl})`
                            : '#000000',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: 'none'
                    }}
                    onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {!avatarUrl && userName.charAt(0).toUpperCase()}
                </button>
            </div>
        </div>
    )
}
