import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ChatGuideView() {
    const { isDark } = useTheme()
    const [selectedQuestion, setSelectedQuestion] = useState(null)

    const faqData = [
        {
            id: 1,
            question: 'Как получить бонусную карту?',
            answer: 'Зарегистрируйтесь в приложении qaraa, и вы автоматически получите бонусную карту. Используйте её при каждой покупке для накопления бонусов.'
        },
        {
            id: 2,
            question: 'Как использовать бонусы?',
            answer: 'Накопленные бонусы можно использовать для оплаты покупок в магазинах qaraa. 1 бонус = 1 тенге.'
        },
        {
            id: 3,
            question: 'Где находятся магазины qaraa?',
            answer: 'Наши магазины расположены в Алматы. Адреса можно посмотреть в разделе "Места".'
        },
        {
            id: 4,
            question: 'Как связаться с поддержкой?',
            answer: 'Вы можете написать нам на email: support@qaraa.kz или позвонить по телефону: +7 (777) 123-45-67'
        }
    ]

    return (
        <div style={{
            padding: '16px',
            paddingBottom: '100px',
            background: isDark ? '#000000' : '#FFFFFF',
            minHeight: 'calc(100vh - 200px)'
        }}>
            {/* Header with 3D Character Placeholder */}
            <div style={{
                background: isDark ? '#1C1C1E' : '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                textAlign: 'center',
                border: `1px solid ${isDark ? '#2C2C2E' : '#E5E5EA'}`,
                boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                {/* 3D Character Placeholder */}
                <div style={{
                    fontSize: '80px',
                    marginBottom: '16px',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    🤖
                </div>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: isDark ? '#FFFFFF' : '#000000',
                    margin: '0 0 8px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    qaraa Гид
                </h2>

                <p style={{
                    fontSize: '15px',
                    color: '#8E8E93',
                    margin: 0
                }}>
                    Здесь я помогу вам найти ответы на ваши вопросы
                </p>
            </div>

            {/* FAQ Section */}
            <div style={{
                marginBottom: '20px'
            }}>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: isDark ? '#FFFFFF' : '#000000',
                    margin: '0 0 16px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                    Часто задаваемые вопросы
                </h3>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {faqData.map((faq) => (
                        <div
                            key={faq.id}
                            onClick={() => setSelectedQuestion(selectedQuestion === faq.id ? null : faq.id)}
                            style={{
                                background: isDark ? '#1C1C1E' : '#FFFFFF',
                                borderRadius: '12px',
                                padding: '16px',
                                border: `1px solid ${isDark ? '#2C2C2E' : '#E5E5EA'}`,
                                boxShadow: isDark
                                    ? '0 2px 8px rgba(0,0,0,0.3)'
                                    : '0 2px 8px rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: selectedQuestion === faq.id ? '12px' : 0
                            }}>
                                <h4 style={{
                                    fontSize: '17px',
                                    fontWeight: '600',
                                    color: isDark ? '#FFFFFF' : '#000000',
                                    margin: 0,
                                    flex: 1,
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                                }}>
                                    {faq.question}
                                </h4>
                                <span style={{
                                    fontSize: '20px',
                                    color: '#007AFF',
                                    marginLeft: '12px',
                                    transform: selectedQuestion === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    ▼
                                </span>
                            </div>

                            {selectedQuestion === faq.id && (
                                <div style={{
                                    fontSize: '15px',
                                    color: isDark ? '#EBEBF5' : '#3C3C43',
                                    lineHeight: 1.5,
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support Button */}
            <button
                onClick={() => alert('Функция чата будет доступна скоро')}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: '#007AFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                💬 Написать в поддержку
            </button>
        </div>
    )
}
