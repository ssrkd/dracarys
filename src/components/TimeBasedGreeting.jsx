import React from 'react'

export default function TimeBasedGreeting({ userName, avatarUrl, onAvatarClick }) {
    const getGreeting = () => {
        const hour = new Date().getHours()

        if (hour >= 5 && hour < 12) {
            return { text: 'Доброе утро', emoji: '☀️' }
        } else if (hour >= 12 && hour < 18) {
            return { text: 'Добрый день', emoji: '👋' }
        } else if (hour >= 18 && hour < 22) {
            return { text: 'Добрый вечер', emoji: '🌙' }
        } else {
            return { text: 'Доброй ночи', emoji: '✨' }
        }
    }

    const greeting = getGreeting()

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            animation: 'fadeIn 0.6s ease'
        }}>
            <div style={{ flex: 1 }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1C1C1E',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
                }}>
                    {greeting.text}, {userName} {greeting.emoji}
                </h1>
            </div>

            <button
                onClick={onAvatarClick}
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0,0,0,0.08)',
                    background: avatarUrl ? `url(${avatarUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                }}
            >
                {!avatarUrl && userName.charAt(0).toUpperCase()}
            </button>
        </div>
    )
}
