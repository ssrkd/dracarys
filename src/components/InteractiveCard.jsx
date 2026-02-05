import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'

export default function InteractiveCard({
    title,
    subtitle,
    description,
    badge,
    icon,
    onClick
}) {
    const { theme, isDark } = useTheme()
    const { t } = useLang()

    return (
        <div
            onClick={onClick}
            style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                WebkitTapHighlightColor: 'transparent'
            }}
            onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08)'
            }}
            onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
            }}
        >
            {/* Icon and Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                {icon && (
                    <div style={{
                        fontSize: '40px',
                        lineHeight: 1
                    }}>
                        {icon}
                    </div>
                )}
                {badge && (
                    <div style={{
                        padding: '6px 10px',
                        background: '#F2F2F7',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#8E8E93',
                        letterSpacing: '-0.1px'
                    }}>
                        {badge}
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#000000',
                margin: '0 0 6px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                letterSpacing: '-0.4px',
                lineHeight: 1.2
            }}>
                {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
                <p style={{
                    fontSize: '16px',
                    color: '#8E8E93',
                    margin: '0 0 6px 0',
                    fontWeight: '500',
                    letterSpacing: '-0.2px',
                    lineHeight: 1.3
                }}>
                    {subtitle}
                </p>
            )}

            {/* Description */}
            {description && (
                <p style={{
                    fontSize: '14px',
                    color: '#8E8E93',
                    margin: 0,
                    lineHeight: 1.5,
                    letterSpacing: '-0.1px'
                }}>
                    {description}
                </p>
            )}

            {/* Arrow */}
            <div style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#007AFF',
                letterSpacing: '-0.2px'
            }}>
                <span>{t('common.open')}</span>
                <span style={{ fontSize: '18px', marginTop: '1px' }}>›</span>
            </div>
        </div>
    )
}
