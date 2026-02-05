import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeDisplay({ cardNumber, bonusBalance, userName }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (canvasRef.current && cardNumber) {
            QRCode.toCanvas(canvasRef.current, cardNumber, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
        }
    }, [cardNumber])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            background: '#FFFFFF',
            minHeight: 'calc(100vh - 140px)'
        }}>
            {/* Card Container */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                padding: '32px 24px',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '20px'
            }}>
                {/* Animated Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    animation: 'shimmer 3s ease-in-out infinite',
                    pointerEvents: 'none'
                }} />

                {/* User Name */}
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    margin: '0 0 24px 0',
                    textAlign: 'center',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.5px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {userName}
                </h2>

                {/* QR Code */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '24px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }} />
                </div>

                {/* Card Number */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.8)',
                        margin: '0 0 6px 0',
                        fontWeight: '500',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}>
                        Номер карты
                    </p>
                    <p style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#FFFFFF',
                        margin: 0,
                        letterSpacing: '2px',
                        fontFamily: 'monospace'
                    }}>
                        {cardNumber}
                    </p>
                </div>

                {/* Bonus Balance */}
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.3)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.9)',
                        margin: '0 0 4px 0',
                        fontWeight: '500'
                    }}>
                        Баланс бонусов
                    </p>
                    <p style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#FFFFFF',
                        margin: 0,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        letterSpacing: '-1px'
                    }}>
                        {bonusBalance || 0}
                    </p>
                </div>
            </div>

            {/* Info Section */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                marginTop: '32px',
                padding: '20px',
                background: '#F5F5F7',
                borderRadius: '16px'
            }}>
                <h3 style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#1C1C1E',
                    margin: '0 0 12px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}>
                    Как использовать
                </h3>
                <ul style={{
                    margin: 0,
                    padding: '0 0 0 20px',
                    color: '#3C3C43',
                    fontSize: '15px',
                    lineHeight: 1.6
                }}>
                    <li style={{ marginBottom: '8px' }}>Покажите QR-код кассиру при оплате</li>
                    <li style={{ marginBottom: '8px' }}>Получайте бонусы за каждую покупку</li>
                    <li>Используйте бонусы в магазине одежды или кофейне</li>
                </ul>
            </div>
        </div>
    )
}
