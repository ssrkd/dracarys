import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import QRCode from 'react-qr-code'

export default function Card({ customer }) {
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState(customer)
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    refreshCustomerData()
  }, [])

  const refreshCustomerData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer.id)
        .single()

      if (error) throw error
      setCustomerData(data)
      
      // Обновляем localStorage
      localStorage.setItem('qaraa_customer', JSON.stringify(data))
    } catch (error) {
      console.error('Error refreshing customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '•••• •••• •••• ••••'
    return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber
  }

  const formatBonus = (bonus) => {
    return new Intl.NumberFormat('ru-RU').format(bonus || 0)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: 'env(safe-area-inset-bottom, 80px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#FFFFFF',
          letterSpacing: '2px'
        }}>
          qaraa
        </div>
        <button
          onClick={() => navigate('/profile')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)'
            e.target.style.transform = 'scale(1)'
          }}
        >
          👤
        </button>
      </div>

      {/* Card */}
      <div style={{
        padding: '20px',
        marginTop: '20px'
      }}>
        <div
          onClick={() => setShowQR(!showQR)}
          style={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            minHeight: '220px'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '50%'
          }} />

          {!showQR ? (
            <>
              {/* Card content */}
              <div style={{
                position: 'relative',
                zIndex: 1
              }}>
                {/* Logo */}
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  marginBottom: '32px'
                }}>
                  qaraa
                </div>

                {/* Card number */}
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  marginBottom: '24px',
                  fontFamily: 'monospace'
                }}>
                  {formatCardNumber(customerData?.card_number)}
                </div>

                {/* Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginBottom: '4px'
                    }}>
                      Владелец карты
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#FFFFFF'
                    }}>
                      {customerData?.fullname}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    📱
                  </div>
                </div>
              </div>

              {/* Tap hint */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500'
              }}>
                Нажмите для QR-кода
              </div>
            </>
          ) : (
            <>
              {/* QR Code */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '164px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px'
                }}>
                  <QRCode
                    value={customerData?.card_number || ''}
                    size={140}
                    level="M"
                  />
                </div>
              </div>

              {/* Tap hint */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500',
                zIndex: 1
              }}>
                Нажмите чтобы скрыть
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bonus section */}
      <div style={{
        padding: '0 20px',
        marginTop: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '4px'
              }}>
                Ваш бонусный баланс
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#FFFFFF'
              }}>
                {formatBonus(customerData?.bonus_balance)} ₸
              </div>
            </div>
            <button
              onClick={refreshCustomerData}
              disabled={loading}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '24px',
                transition: 'all 0.3s',
                transform: loading ? 'rotate(360deg)' : 'rotate(0deg)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🔄
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4px'
              }}>
                Всего потрачено
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF'
              }}>
                {formatBonus(customerData?.total_spent || 0)} ₸
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4px'
              }}>
                Статус карты
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#34C759'
              }}>
                {customerData?.status === 'active' ? '✓ Активна' : '⚠ Заблокирована'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '0 20px',
        marginTop: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate('/history')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          📜 История
        </button>
        <button
          onClick={() => {
            alert('Функция добавления в Apple Wallet будет доступна скоро!')
          }}
          style={{
            flex: 1,
            padding: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            color: '#000000',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          🍎 В Wallet
        </button>
      </div>

      {/* Info card */}
      <div style={{
        padding: '0 20px',
        marginTop: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: '12px'
          }}>
            💡 Как это работает?
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6'
          }}>
            • Покажите QR-код кассиру при покупке<br />
            • Получайте 5% бонусами от каждой покупки<br />
            • Оплачивайте бонусами следующие покупки<br />
            • Следите за балансом в приложении
          </div>
        </div>
      </div>
    </div>
  )
}
