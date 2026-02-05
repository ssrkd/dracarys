import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import './Home.css'

// Импорты изображений
import logoQaraa from '../images/logo-qaraa.png'

export default function AkaAI() {
  usePageTitle('AKA.AI - Ваш персональный ассистент')
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversation, setConversation] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [animatedText, setAnimatedText] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [audioVisualizerActive, setAudioVisualizerActive] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState(null)

  const chatContainerRef = useRef(null)
  const recognitionRef = useRef(null)
  const animationTimeoutRef = useRef(null)

  const handleLogout = () => {
    try { localStorage.removeItem('qaraa_customer') } catch (_) { }
    try {
      window.location.href = '/'
    } catch (_) {
      navigate('/')
    }
  }

  // Анимация печатающегося текста
  const animateText = (text, callback) => {
    setAnimatedText('')
    let index = 0
    const animate = () => {
      if (index < text.length) {
        setAnimatedText(prev => prev + text[index])
        index++
        animationTimeoutRef.current = setTimeout(animate, 50)
      } else if (callback) {
        callback()
      }
    }
    animate()
  }

  // Инициализация распознавания речи
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'ru-RU'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setAudioVisualizerActive(true)
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        handleUserInput(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setAudioVisualizerActive(false)
        if (event.error === 'not-allowed') {
          setMicrophonePermission(false)
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setAudioVisualizerActive(false)
      }
    }

    // Запрос разрешения на микрофон
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicrophonePermission(true))
      .catch(() => setMicrophonePermission(false))

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Приветственное сообщение
  useEffect(() => {
    const welcomeMessage = "Добро пожаловать! Я AKA.AI - ваш персональный ассистент. Нажмите на микрофон или введите сообщение, чтобы начать общение."
    setTimeout(() => {
      animateText(welcomeMessage, () => {
        setConversation([{ type: 'ai', text: welcomeMessage, timestamp: new Date() }])
      })
    }, 1000)
  }, [])

  const handleUserInput = (input) => {
    if (!input.trim()) return

    const userMessage = { type: 'user', text: input, timestamp: new Date() }
    setConversation(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsProcessing(true)

    // Симуляция обработки AI
    setTimeout(() => {
      const responses = [
        "Понял вас! Обрабатываю ваш запрос...",
        "Интересный вопрос! Позвольте мне подумать...",
        "Я анализирую информацию для вас...",
        "Хороший вопрос! Вот что я думаю по этому поводу...",
        "Спасибо за ваш вопрос! Вот мой ответ..."
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const aiMessage = { type: 'ai', text: randomResponse, timestamp: new Date() }

      setConversation(prev => [...prev, aiMessage])
      animateText(randomResponse)
      setIsProcessing(false)
    }, 1500)
  }

  const startListening = () => {
    if (recognitionRef.current && microphonePermission) {
      recognitionRef.current.start()
    } else if (microphonePermission === false) {
      alert('Разрешите доступ к микрофону для использования голосового ввода')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 0 2px rgba(48, 209, 88, 0.2); } 50% { box-shadow: 0 0 0 4px rgba(48, 209, 88, 0.4); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes typing { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes audioWave { 
          0%, 100% { height: 4px; } 
          25% { height: 12px; } 
          50% { height: 8px; } 
          75% { height: 16px; } 
        }
        
        .ai-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
        }
        
        .ai-main-content {
          flex: 1;
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          gap: 20px;
          padding: 20px;
        }
        
        .ai-left-panel {
          width: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .ai-center-panel {
          flex: 1;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .ai-right-panel {
          width: 280px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
        }
        
        .ai-avatar-section {
          text-align: center;
          padding: 20px 0;
        }
        
        .ai-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: white;
          animation: float 3s ease-in-out infinite;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .ai-status {
          color: white;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .ai-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #30d158;
          margin: 0 auto;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .ai-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .ai-voice-button {
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: ${isListening ? 'linear-gradient(45deg, #ff3b30, #ff6b6b)' : 'linear-gradient(45deg, #30d158, #34c759)'};
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 16px;
          ${isListening ? 'animation: glow 1s ease-in-out infinite;' : ''}
        }
        
        .ai-voice-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .ai-chat-container {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .ai-message {
          max-width: 80%;
          padding: 16px 20px;
          border-radius: 18px;
          animation: slideUp 0.3s ease;
          word-wrap: break-word;
        }
        
        .ai-message.user {
          align-self: flex-end;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border-bottom-right-radius: 6px;
        }
        
        .ai-message.ai {
          align-self: flex-start;
          background: #f5f5f7;
          color: #1d1d1f;
          border-bottom-left-radius: 6px;
        }
        
        .ai-input-section {
          padding: 20px 24px;
          border-top: 1px solid rgba(0,0,0,0.1);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .ai-text-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e5e5ea;
          border-radius: 12px;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .ai-text-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .ai-send-button {
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ai-send-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
        }
        
        .ai-send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .ai-animated-text {
          font-size: 18px;
          color: #667eea;
          font-weight: 500;
          text-align: center;
          padding: 20px;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .ai-audio-visualizer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 40px;
          margin: 16px 0;
        }
        
        .ai-audio-bar {
          width: 4px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 2px;
          animation: ${audioVisualizerActive ? 'audioWave 0.6s ease-in-out infinite' : 'none'};
        }
        
        .ai-settings-section {
          color: white;
        }
        
        .ai-settings-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .ai-setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .ai-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ai-toggle.active {
          background: #30d158;
        }
        
        .ai-toggle::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
        }
        
        .ai-toggle.active::after {
          left: 22px;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .ai-main-content {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }
          
          .ai-left-panel,
          .ai-right-panel {
            width: 100%;
          }
          
          .ai-left-panel {
            order: 2;
          }
          
          .ai-center-panel {
            order: 1;
            min-height: 60vh;
          }
          
          .ai-right-panel {
            order: 3;
          }
          
          .ai-avatar {
            width: 80px;
            height: 80px;
            font-size: 32px;
          }
          
          .ai-chat-container {
            padding: 16px;
          }
          
          .ai-input-section {
            padding: 16px;
          }
        }
      `}</style>

      <div className="ai-container">
        {/* Fixed Header */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            maxWidth: '1440px', margin: '0 auto', padding: '20px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'opacity 0.3s ease', opacity: 1 }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <img src={logoQaraa} alt="qaraa" style={{ height: '42px', width: 'auto', transition: 'transform 0.3s ease' }} />
              <div>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E', lineHeight: '1' }}>AKA.AI</div>
                <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '4px' }}>Персональный ассистент</div>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  width: '44px', height: '44px', background: 'transparent', border: 'none',
                  borderRadius: '50%', fontSize: '24px', color: '#1D1D1F', cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', letterSpacing: '2px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                ⋯
              </button>

              {profileMenuOpen && (
                <div
                  onMouseLeave={() => setProfileMenuOpen(false)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute', top: '52px', right: 0, background: '#FFFFFF',
                    border: '1px solid #E5E5EA', borderRadius: '14px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                    minWidth: '180px', zIndex: 200, animation: 'scaleIn 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/dashboard') }}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'transparent',
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Каталог
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/profile') }}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'transparent',
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Профиль
                  </button>
                  <div style={{ height: 1, background: '#F2F2F7' }} />
                  <button
                    onClick={() => { setProfileMenuOpen(false); setShowLogoutConfirm(true) }}
                    style={{
                      width: '100%', padding: '12px 14px', background: 'transparent',
                      border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', color: '#FF3B30', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="ai-main-content" style={{ paddingTop: '100px' }}>
          {/* Left Panel - Avatar & Controls */}
          <div className="ai-left-panel">
            <div className="ai-avatar-section">
              <div className="ai-avatar">🤖</div>
              <div className="ai-status">
                {isListening ? 'Слушаю...' : isProcessing ? 'Обрабатываю...' : 'Готов к работе'}
              </div>
              <div className={`ai-status-indicator ${isListening || isProcessing ? 'active' : ''}`}></div>
            </div>

            <div className="ai-controls">
              <button
                className="ai-voice-button"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || microphonePermission === false}
              >
                {isListening ? '🛑 Остановить' : '🎤 Говорить'}
              </button>

              {audioVisualizerActive && (
                <div className="ai-audio-visualizer">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="ai-audio-bar"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: '4px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Panel - Chat */}
          <div className="ai-center-panel">
            {animatedText && (
              <div className="ai-animated-text">
                {animatedText}
                <span style={{ animation: 'typing 1s ease-in-out infinite' }}>|</span>
              </div>
            )}

            <div className="ai-chat-container" ref={chatContainerRef}>
              {conversation.map((message, index) => (
                <div key={index} className={`ai-message ${message.type}`}>
                  <div>{message.text}</div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: message.type === 'user' ? 'right' : 'left'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="ai-message ai">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #667eea',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Печатаю...
                  </div>
                </div>
              )}
            </div>

            <div className="ai-input-section">
              <input
                type="text"
                className="ai-text-input"
                placeholder="Введите ваше сообщение..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleUserInput(currentMessage)
                  }
                }}
                disabled={isProcessing}
              />
              <button
                className="ai-send-button"
                onClick={() => handleUserInput(currentMessage)}
                disabled={isProcessing || !currentMessage.trim()}
              >
                Отправить
              </button>
            </div>
          </div>

          {/* Right Panel - Settings */}
          <div className="ai-right-panel">
            <div className="ai-settings-section">
              <div className="ai-settings-title">Настройки</div>

              <div className="ai-setting-item">
                <span>Голосовой ввод</span>
                <div className={`ai-toggle ${microphonePermission ? 'active' : ''}`}></div>
              </div>

              <div className="ai-setting-item">
                <span>Уведомления</span>
                <div className="ai-toggle active"></div>
              </div>

              <div className="ai-setting-item">
                <span>Темная тема</span>
                <div className="ai-toggle"></div>
              </div>

              <div className="ai-setting-item">
                <span>Автосохранение</span>
                <div className="ai-toggle active"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '32px',
              maxWidth: '400px', width: '90%', textAlign: 'center',
              animation: 'scaleIn 0.3s ease'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#1D1D1F' }}>Выйти из аккаунта?</h3>
              <p style={{ marginBottom: '24px', color: '#86868B' }}>
                Вы уверены, что хотите выйти из своего аккаунта?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '12px 24px', border: '2px solid #E5E5EA',
                    borderRadius: '12px', background: 'transparent',
                    color: '#1D1D1F', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 24px', border: 'none',
                    borderRadius: '12px', background: '#FF3B30',
                    color: '#FFFFFF', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
