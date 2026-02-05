import React from 'react'

export default function PandaAnimation({ showPassword, emotion = 'neutral' }) {
    // Emotion states: 'neutral', 'error', 'success'

    const getEyeExpression = () => {
        if (emotion === 'error') {
            return { squint: true, tear: true }
        }
        if (emotion === 'success') {
            return { happy: true }
        }
        return { normal: true }
    }

    const expression = getEyeExpression()

    return (
        <div style={{
            width: '180px',
            height: '180px',
            margin: '0 auto 24px',
            position: 'relative'
        }}>
            {/* Panda Face - More rounded and recognizable */}
            <div style={{
                width: '100%',
                height: '100%',
                background: '#FFFFFF',
                borderRadius: '50%',
                position: 'relative',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                border: '3px solid #f0f0f0'
            }}>
                {/* Larger, more prominent black ears */}
                <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    background: '#000000',
                    borderRadius: '50%',
                    top: '5px',
                    left: '15px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }} />

                <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    background: '#000000',
                    borderRadius: '50%',
                    top: '5px',
                    right: '15px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }} />

                {/* MUCH larger black eye patches - signature panda look */}
                <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '60px',
                    background: '#000000',
                    borderRadius: '50% 50% 45% 45%',
                    top: '50px',
                    left: '22px',
                    transform: 'rotate(-5deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Left Eye - white part */}
                    <div style={{
                        width: '18px',
                        height: showPassword ? '18px' : (expression.squint ? '4px' : '4px'),
                        background: '#FFFFFF',
                        borderRadius: '50%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {showPassword && !expression.squint && (
                            <div style={{
                                width: '10px',
                                height: '10px',
                                background: '#000000',
                                borderRadius: '50%'
                            }} />
                        )}
                    </div>

                    {/* Tear for error state */}
                    {expression.tear && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '8px',
                            height: '12px',
                            background: '#4FC3F7',
                            borderRadius: '50% 0 50% 50%',
                            animation: 'tearDrop 2s ease-in-out infinite'
                        }} />
                    )}
                </div>

                <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '60px',
                    background: '#000000',
                    borderRadius: '50% 50% 45% 45%',
                    top: '50px',
                    right: '22px',
                    transform: 'rotate(5deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Right Eye - white part */}
                    <div style={{
                        width: '18px',
                        height: showPassword ? '18px' : (expression.squint ? '4px' : '4px'),
                        background: '#FFFFFF',
                        borderRadius: '50%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {showPassword && !expression.squint && (
                            <div style={{
                                width: '10px',
                                height: '10px',
                                background: '#000000',
                                borderRadius: '50%'
                            }} />
                        )}
                    </div>

                    {/* Tear for error state */}
                    {expression.tear && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            right: '50%',
                            transform: 'translateX(50%)',
                            width: '8px',
                            height: '12px',
                            background: '#4FC3F7',
                            borderRadius: '50% 0 50% 50%',
                            animation: 'tearDrop 2s ease-in-out infinite 0.3s'
                        }} />
                    )}
                </div>

                {/* Nose - more prominent and cuter */}
                <div style={{
                    position: 'absolute',
                    width: '22px',
                    height: '18px',
                    background: '#000000',
                    borderRadius: '0 0 50% 50%',
                    bottom: '58px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 -2px 4px rgba(255,255,255,0.3)'
                }}>
                    <div style={{
                        width: '8px',
                        height: '5px',
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: '4px'
                    }} />
                </div>

                {/* Mouth - changes based on emotion */}
                {expression.happy ? (
                    <div style={{
                        position: 'absolute',
                        width: '40px',
                        height: '20px',
                        border: '3px solid #000000',
                        borderTop: 'none',
                        borderRadius: '0 0 70% 70% ',
                        bottom: '35px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }} />
                ) : expression.squint ? (
                    <div style={{
                        position: 'absolute',
                        width: '30px',
                        height: '8px',
                        border: '3px solid #000000',
                        borderTop: 'none',
                        borderBottom: 'none',
                        borderRadius: '50%',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(180deg)'
                    }} />
                ) : (
                    <div style={{
                        position: 'absolute',
                        width: '35px',
                        height: '16px',
                        border: '3px solid #000000',
                        borderTop: 'none',
                        borderRadius: '0 0 50% 50%',
                        bottom: '38px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }} />
                )}

                {/* Rosy cheeks - signature cute touch */}
                <div style={{
                    position: 'absolute',
                    width: '28px',
                    height: '20px',
                    background: 'radial-gradient(ellipse, rgba(255, 182, 193, 0.5) 0%, transparent 70%)',
                    borderRadius: '50%',
                    bottom: '45px',
                    left: '18px'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '28px',
                    height: '20px',
                    background: 'radial-gradient(ellipse, rgba(255, 182, 193, 0.5) 0%, transparent 70%)',
                    borderRadius: '50%',
                    bottom: '45px',
                    right: '18px'
                }} />
            </div>

            {/* Status message */}
            <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '13px',
                color: emotion === 'error' ? '#FF3B30' : emotion === 'success' ? '#34C759' : '#86868b',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                transition: 'color 0.3s ease'
            }}>
                {emotion === 'error' ? '😢 Упс, ошибка!' :
                    emotion === 'success' ? '✨ Отлично!' :
                        showPassword ? '👀 Вижу пароль' : '🙈 Не смотрю'}
            </div>

            <style>{`
        @keyframes tearDrop {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.7; }
          50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
