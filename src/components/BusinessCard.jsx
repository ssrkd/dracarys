import React from 'react'

export default function BusinessCard({
    title,
    subtitle,
    description,
    imageUrl,
    gradient,
    badge,
    onClick
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                WebkitTapHighlightColor: 'transparent',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'
            }}
            onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
            }}
            onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
            }}
        >
            {/* Background Image/Pattern */}
            {imageUrl && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60%',
                    height: '100%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.2,
                    filter: 'blur(2px)'
                }} />
            )}

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {badge && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#FFFFFF',
                        marginBottom: '12px',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                        {badge}
                    </div>
                )}

                <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    margin: '0 0 8px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {title}
                </h3>

                {subtitle && (
                    <p style={{
                        fontSize: '15px',
                        color: 'rgba(255,255,255,0.9)',
                        margin: '0 0 12px 0',
                        fontWeight: '500',
                        letterSpacing: '-0.2px'
                    }}>
                        {subtitle}
                    </p>
                )}

                {description && (
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.8)',
                        margin: 0,
                        lineHeight: 1.4
                    }}>
                        {description}
                    </p>
                )}
            </div>

            {/* Action Button */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
            }}>
                <span style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}>
                    Открыть
                </span>
                <span style={{
                    fontSize: '18px',
                    transition: 'transform 0.3s ease'
                }}>
                    →
                </span>
            </div>
        </div>
    )
}
