import React from 'react'

export default function BottomNav({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'home', label: 'Главная', icon: '🏠' },
        { id: 'qr', label: 'QR-код', icon: '⬜', isLogo: true },
        { id: 'locations', label: 'Локации', icon: '📍' },
        { id: 'profile', label: 'Профиль', icon: '👤' }
    ]

    return (
        <>
            <style>{`
        @keyframes tabPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
                zIndex: 100,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: '0 16px'
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
                                    gap: '4px',
                                    padding: tab.isLogo ? '4px 8px' : '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    WebkitTapHighlightColor: 'transparent',
                                    position: 'relative'
                                }}
                                onTouchStart={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.9)'
                                }}
                                onTouchEnd={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    fontSize: tab.isLogo ? '32px' : '24px',
                                    transition: 'all 0.3s ease',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                    animation: isActive ? 'tabPulse 2s ease-in-out infinite' : 'none',
                                    filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)'
                                }}>
                                    {tab.icon}
                                </div>

                                {/* Label */}
                                {!tab.isLogo && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: isActive ? '600' : '500',
                                        color: isActive ? '#007AFF' : '#8E8E93',
                                        transition: 'all 0.3s ease',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                                    }}>
                                        {tab.label}
                                    </span>
                                )}

                                {/* Active indicator */}
                                {isActive && !tab.isLogo && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#007AFF',
                                        animation: 'fadeIn 0.3s ease'
                                    }} />
                                )}
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
