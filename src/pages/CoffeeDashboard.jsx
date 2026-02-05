import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useLang } from '../context/LangContext'
import qaraaCoffee from '../images/qaraacoffee.png'
import { supabase } from '../supabaseClient'

export default function CoffeeDashboard() {
    usePageTitle('qaraa.coffee')
    const navigate = useNavigate()
    const { t, lang } = useLang()
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)

    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchMenu()

        // Auto-refresh menu every 7 seconds
        const interval = setInterval(() => {
            fetchMenu(true); // silent fetch
        }, 7000);

        return () => clearInterval(interval);
    }, [])

    const fetchMenu = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data: cats } = await supabase.from('coffee_categories').select('*').order('sort_order');
            const { data: menu } = await supabase.from('coffee_menu').select('*').eq('is_available', true).order('sort_order');

            if (cats && menu) {
                const grouped = cats.map(cat => ({
                    category: cat.name,
                    items: menu.filter(item => item.category_id === cat.id)
                })).filter(g => g.items.length > 0);
                setMenuData(grouped);
            }
        } catch (err) {
            console.error('Error fetching menu:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        try { localStorage.removeItem('qaraa_customer') } catch (_) { }
        navigate('/')
    }

    return (
        <>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes steam { 
          0% { opacity: 0.8; transform: translateY(0) scale(1); }
          50% { opacity: 0.5; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.4); }
        }
        
        .coffee-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15) !important;
        }
        
        @media (max-width: 768px) {
          .coffee-header { padding: 12px 16px !important; }
          .coffee-logo { height: 32px !important; }
          .coffee-title { font-size: 32px !important; margin-bottom: 12px !important; }
          .coffee-subtitle { font-size: 15px !important; }
          .coffee-content { padding: 0 16px !important; }
          .coffee-section { padding-top: 76px !important; padding-bottom: 40px !important; }
          .coffee-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .coffee-category-title { font-size: 22px !important; }
        }
      `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FFF5E6 0%, #FFFFFF 50%, #F0F4FF 100%)' }}>
                {/* Fixed Header */}
                <header style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'saturate(180%) blur(20px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                    boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.3s ease'
                }}>
                    <div className="coffee-header" style={{
                        maxWidth: '1440px', margin: '0 auto', padding: '20px 48px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                            onClick={() => navigate('/dashboard')}
                        >
                            <img src={qaraaCoffee} alt="qaraa coffee" className="coffee-logo" style={{ height: '48px', width: 'auto' }} />
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: '700', color: '#1C1C1E' }}>qaraa.coffee</div>
                                <div style={{ fontSize: '12px', color: '#8E8E93' }}>
                                    {lang === 'kk' ? 'Жаңа кофе және жайлы орта' : lang === 'ru' ? 'Свежий кофе и уютная атмосфера' : 'Fresh coffee and cozy atmosphere'}
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                style={{
                                    width: '44px', height: '44px', background: 'transparent', border: 'none',
                                    borderRadius: '50%', fontSize: '24px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    WebkitTapHighlightColor: 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                ⋯
                            </button>
                            {profileMenuOpen && (
                                <div
                                    onMouseLeave={() => setProfileMenuOpen(false)}
                                    style={{
                                        position: 'absolute', top: '52px', right: 0,
                                        background: '#FFFFFF', border: '1px solid #E5E5EA',
                                        borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        overflow: 'hidden', minWidth: '180px', zIndex: 200,
                                        animation: 'scaleIn 0.2s ease'
                                    }}
                                >
                                    <button onClick={() => { setProfileMenuOpen(false); navigate('/dashboard') }}
                                        style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {lang === 'kk' ? 'Басты бет' : lang === 'ru' ? 'Главная' : 'Home'}
                                    </button>
                                    <div style={{ height: 1, background: '#F2F2F7' }} />
                                    <button onClick={() => { setProfileMenuOpen(false); navigate('/profile') }}
                                        style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {lang === 'kk' ? 'Профиль' : lang === 'ru' ? 'Профиль' : 'Profile'}
                                    </button>
                                    <div style={{ height: 1, background: '#F2F2F7' }} />
                                    <button onClick={() => { setProfileMenuOpen(false); handleLogout() }}
                                        style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', fontWeight: 700, cursor: 'pointer', color: '#FF3B30', transition: 'background 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {lang === 'kk' ? 'Шығу' : lang === 'ru' ? 'Выйти' : 'Log out'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="coffee-section" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
                    <div className="coffee-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeIn 0.8s ease' }}>
                            <div style={{ fontSize: '72px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>☕</div>
                            <h1 className="coffee-title" style={{
                                fontSize: '56px', fontWeight: '800', letterSpacing: '-2px',
                                marginBottom: '16px', color: '#1C1C1E',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                {lang === 'kk' ? 'Қош келдіңіз қонақ үйімізге' : lang === 'ru' ? 'Добро пожаловать в нашу кофейню' : 'Welcome to our coffee shop'}
                            </h1>
                            <p className="coffee-subtitle" style={{
                                fontSize: '19px', color: '#667eea', marginBottom: '32px',
                                fontWeight: 500, maxWidth: '600px', margin: '0 auto'
                            }}>
                                {lang === 'kk' ? 'Жаңа кофе және тамаша орта. Жақында ашылады!' : lang === 'ru' ? 'Свежий кофе и прекрасная атмосфера. Скоро открытие!' : 'Fresh coffee and great atmosphere. Opening soon!'}
                            </p>
                        </div>

                        {/* Coming Soon Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '14px',
                            padding: '16px 28px', borderRadius: '100px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            color: '#667eea', fontWeight: '600', marginBottom: '56px',
                            animation: 'slideUp 0.6s ease 0.2s backwards, float 3s ease-in-out 1s infinite',
                            fontSize: '16px', backdropFilter: 'blur(10px)',
                            position: 'relative', left: '50%', transform: 'translateX(-50%)'
                        }}>
                            <span style={{ fontSize: '20px' }}>🎉</span>
                            {lang === 'kk' ? 'Жақында ашылады' : lang === 'ru' ? 'Скоро открытие' : 'Opening Soon'}
                        </div>

                        {/* Menu Items */}
                        <div style={{ marginTop: '64px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#8E8E93' }}>Загрузка меню...</div>
                            ) : (
                                menuData.map((category, idx) => (
                                    <div key={idx} style={{ marginBottom: '48px', animation: `slideUp 0.6s ease ${idx * 0.1}s backwards` }}>
                                        <h2 className="coffee-category-title" style={{
                                            fontSize: '32px', fontWeight: '700', marginBottom: '24px',
                                            color: '#1C1C1E', letterSpacing: '-1px',
                                            display: 'flex', alignItems: 'center', gap: '12px'
                                        }}>
                                            <span>{category.category}</span>
                                            <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, transparent 100%)' }} />
                                        </h2>
                                        <div className="coffee-grid" style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                            gap: '20px'
                                        }}>
                                            {category.items.map((item, iIdx) => (
                                                <div
                                                    key={item.id}
                                                    className="coffee-card"
                                                    style={{
                                                        background: 'white',
                                                        borderRadius: '24px',
                                                        padding: '24px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                        border: '1px solid rgba(0,0,0,0.02)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '12px',
                                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                                        animation: `fadeIn 0.6s ease ${0.4 + iIdx * 0.1}s backwards`
                                                    }}
                                                >
                                                    {item.image_url && (
                                                        <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '8px' }}>
                                                            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1C1C1E', margin: 0 }}>{item.name}</h3>
                                                        <div style={{ fontSize: '17px', fontWeight: '800', color: '#667eea' }}>{item.price} ₸</div>
                                                    </div>
                                                    <p style={{ fontSize: '14px', color: '#8E8E93', margin: 0, lineHeight: '1.5', fontWeight: 500 }}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Info */}
                        <div style={{
                            marginTop: '80px',
                            padding: '40px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '24px',
                            textAlign: 'center',
                            border: '1px solid rgba(0, 0, 0, 0.04)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <p style={{ fontSize: '17px', color: '#1C1C1E', marginBottom: '12px', fontWeight: '600' }}>
                                {lang === 'kk' ? '📍 Орналасқан жері: Жақында хабарланады' : lang === 'ru' ? '📍 Адрес: Скоро будет объявлено' : '📍 Location: To be announced soon'}
                            </p>
                            <p style={{ fontSize: '15px', color: '#8E8E93', margin: 0 }}>
                                {lang === 'kk' ? 'Ашылу туралы хабарламалар алу үшін біздің жаңалықтарды қадағалаңыз' : lang === 'ru' ? 'Следите за новостями, чтобы узнать о дате открытия' : 'Stay tuned for the opening date announcement'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
