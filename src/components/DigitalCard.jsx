import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import cardImage from '../images/card.png'
import cardImage2 from '../images/card2.png'
import appleWalletIcon from '../images/applewallet.png'

export default function DigitalCard({ customerId, cardNumber, bonusBalance, userName }) {
    const { isDark } = useTheme()
    const { t } = useLang()
    const canvasRef = useRef(null)
    const barcodeCanvasRef = useRef(null)
    const [selectedDesignId, setSelectedDesignId] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [showBarcode, setShowBarcode] = useState(false)
    const [showWalletAlert, setShowWalletAlert] = useState(false)

    const cardDesigns = [
        { id: 1, image: cardImage, name: 'Дизайн 1' },
        { id: 2, image: cardImage2, name: 'Дизайн 2' }
    ]

    const selectedCard = cardDesigns.find(d => d.id === selectedDesignId)?.image || cardImage

    // Load saved design on mount
    useEffect(() => {
        if (customerId) {
            const saved = localStorage.getItem(`qaraa_card_design_${customerId}`)
            if (saved) {
                const id = parseInt(saved)
                if (cardDesigns.find(d => d.id === id)) {
                    setSelectedDesignId(id)
                }
            }
        }
    }, [customerId])

    // Format card number with bullets like CardInfo.jsx
    const formatCardNumber = (number) => {
        if (!number) return ''
        const str = number.toString()
        const groups = str.match(/.{1,4}/g) || []
        if (groups.length <= 1) return str
        // Show first 4 digits, bullets for middle groups, last 4 digits
        return groups[0] + ' •••• •••• ' + groups[groups.length - 1]
    }

    useEffect(() => {
        if (canvasRef.current && cardNumber && !showBarcode) {
            QRCode.toCanvas(canvasRef.current, cardNumber, {
                width: 150,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
        }
    }, [cardNumber, showBarcode])

    useEffect(() => {
        if (barcodeCanvasRef.current && cardNumber && showBarcode) {
            try {
                // Ensure we only use digits for the barcode if possible, or at least clean it
                const cleanNumber = cardNumber.toString().replace(/\s+/g, '')
                JsBarcode(barcodeCanvasRef.current, cleanNumber, {
                    format: 'CODE128',
                    width: 2, // Slightly narrower bars can be sharper on mobile
                    height: 80, // Slightly shorter to fit better
                    displayValue: true,
                    background: '#FFFFFF',
                    lineColor: '#000000',
                    fontSize: 16,
                    margin: 20 // More margin (quiet zone) helps scanners
                })
            } catch (e) {
                console.error('Barcode generation error:', e)
            }
        }
    }, [cardNumber, showBarcode])

    const handleAddToWallet = () => {
        setShowWalletAlert(true)
    }

    return (
        <div style={{
            padding: '20px',
            paddingBottom: '100px',
            background: '#F9F9F9',
            minHeight: 'calc(100vh - 200px)'
        }}>
            {/* Card with overlay - clickable */}
            <div
                onClick={() => setShowModal(true)}
                style={{
                    maxWidth: '400px',
                    margin: '0 auto 24px',
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <img
                    src={selectedCard}
                    alt="qaraa card"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transition: 'opacity 0.5s ease'
                    }}
                />

                {/* Overlay with card info */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Card Number - справа и сверху */}
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#000000',
                        letterSpacing: '2px',
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        paddingRight: '10px',
                        marginTop: '-10px'
                    }}>
                        {cardNumber ? cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : ''}
                    </div>

                    {/* Бонусы - слева внизу */}
                    <div style={{
                        paddingLeft: '5px',
                        marginBottom: '-20px'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#000000',
                            opacity: 0.7,
                            marginBottom: '4px'
                        }}>
                            {t('home.bonuses')}
                        </div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#000000'
                        }}>
                            {bonusBalance ? bonusBalance.toLocaleString('en-US') : 0} ₸
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for card design selection */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        animation: 'fadeIn 0.3s ease'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '24px',
                            padding: '28px',
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            animation: 'slideUp 0.3s ease',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <h2 style={{
                            fontSize: '26px',
                            fontWeight: '700',
                            color: '#000000',
                            margin: '0 0 24px 0',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            letterSpacing: '-0.5px'
                        }}>
                            Выберите дизайн карты
                        </h2>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {cardDesigns.map((design) => (
                                <div
                                    key={design.id}
                                    onClick={() => {
                                        setSelectedDesignId(design.id)
                                        if (customerId) {
                                            localStorage.setItem(`qaraa_card_design_${customerId}`, design.id.toString())
                                        }
                                        setShowModal(false)
                                    }}
                                    style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedDesignId === design.id
                                            ? '3px solid #007AFF'
                                            : 'none',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        boxShadow: selectedDesignId === design.id
                                            ? '0 4px 12px rgba(0, 122, 255, 0.3)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    }}
                                >
                                    <img
                                        src={design.image}
                                        alt={design.name}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                    {selectedDesignId === design.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: '#007AFF',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            color: '#FFFFFF',
                                            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.4)'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                width: '100%',
                                marginTop: '24px',
                                padding: '16px',
                                background: '#F2F2F7',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: '#000000',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            onTouchStart={(e) => {
                                e.currentTarget.style.transform = 'scale(0.97)'
                                e.currentTarget.style.background = '#E5E5EA'
                            }}
                            onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.background = '#F2F2F7'
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {/* QR Code / Barcode Section - clickable to toggle */}
            <div
                onClick={() => setShowBarcode(!showBarcode)}
                style={{
                    maxWidth: '400px',
                    margin: '0 auto 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '24px',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    minHeight: showBarcode ? '160px' : 'auto'
                }}
            >
                <div style={{
                    fontSize: '13px',
                    color: '#8E8E93',
                    marginBottom: '12px',
                    fontWeight: '600'
                }}>
                    {showBarcode ? t('card.clickForBarcode') : t('card.clickForQR')}
                </div>
                {!showBarcode ? (
                    <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <canvas
                            ref={barcodeCanvasRef}
                            style={{
                                display: 'block',
                                maxWidth: '100%',
                                height: 'auto'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Apple Wallet Button */}
            <button
                onClick={handleAddToWallet}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    display: 'flex',
                    padding: '16px',
                    background: '#000000',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.97)'
                    e.currentTarget.style.background = '#1C1C1E'
                }}
                onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.background = '#000000'
                }}
            >
                <img
                    src={appleWalletIcon}
                    alt="Apple Wallet"
                    style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                    }}
                />
                <span>{t('wallet.add')}</span>
            </button>

            {/* Premium Apple Wallet Alert Modal */}
            {showWalletAlert && (
                <div
                    onClick={() => setShowWalletAlert(false)}
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
                            background: '#FFFFFF',
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
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#1C1C1E',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src={appleWalletIcon}
                                    alt="Apple Wallet"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>
                        <h3 style={{
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#1a1a1a',
                            marginBottom: '12px',
                            letterSpacing: '-0.5px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                        }}>
                            Apple Wallet
                        </h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#6B7280',
                            lineHeight: 1.5,
                            marginBottom: '28px',
                            fontWeight: '500'
                        }}>
                            {t('wallet.soon')}
                        </p>
                        <button
                            onClick={() => setShowWalletAlert(false)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: '#1a1a1a',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
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
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}
