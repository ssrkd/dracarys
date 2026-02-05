import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import type { Product } from '../types/database';
import { SEO } from '../components/SEO';

// Импорты изображений из src/photo
import adamImage from '../photo/adam.png';
import crmIcon from '../photo/crm.png';
import supportIcon from '../photo/support.png';
import securatiyIcon from '../photo/securatiy.png';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        try {
            console.log('Home: Loading products...');
            const products = await productService.getFeaturedProducts();
            const visibleProducts = products.filter(p => p.is_visible !== false);
            const avail = await inventoryService.fetchAvailability();
            const inStock = visibleProducts.filter(p => inventoryService.totalVisibleForProduct(avail, p.name, p.hidden_colors) > 0);
            console.log('Home: Products loaded (in stock):', inStock.length);
            setFeaturedProducts(inStock);
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('Home: Initializing...');
        loadProducts();

        const subscription = productService.subscribeToProducts(() => {
            console.log('Home: Real-time update detected');
            loadProducts();
        });

        return () => {
            console.log('Home: Unmounting...');
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
            <SEO
                title="dracarys — выбирай осознанно. Ваш стиль. Ваш выбор."
                description="dracarys — выбирай осознанно. Мы создаем одежду для тех, кто ищет совершенство в простоте. Безопасная экосистема и премиальное качество."
            />

            {/* Hero Section */}
            <section className="home-hero-section" style={{
                paddingTop: '60px',
                paddingBottom: '100px',
                background: '#FFFFFF'
            }}>
                <div className="home-hero-container" style={{
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '0 48px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
                    gap: '40px 80px',
                    alignItems: 'center'
                }}>
                    <div className="animate-fade-in" style={{ paddingTop: '40px' }}>
                        <h1 className="home-hero-title" style={{
                            fontSize: 'clamp(40px, 8vw, 80px)',
                            fontWeight: '700',
                            lineHeight: '1.05',
                            marginBottom: '32px',
                            color: '#1d1d1f',
                            letterSpacing: '-0.015em'
                        }}>
                            dracarys — выбирай осознанно.<br />Ваш стиль.<br />Ваш выбор.
                        </h1>

                        {/* Описание для десктопа - скрыто на мобильных */}
                        <div className="hidden md:block">
                            <p style={{
                                fontSize: 'clamp(18px, 2vw, 21px)',
                                color: '#6e6e73',
                                lineHeight: '1.47',
                                marginBottom: '48px',
                                maxWidth: '600px',
                                fontWeight: '400'
                            }}>
                                Мы создаем одежду для тех, кто ищет совершенство в простоте. Каждая вещь dracarys — это баланс между современной эстетикой и бескомпромиссным качеством материалов.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/products')}
                                    style={{
                                        padding: '16px 32px',
                                        background: '#0A0A0A',
                                        color: '#FFFFFF',
                                        borderRadius: '100px',
                                        fontWeight: '600',
                                        fontSize: '17px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Перейти в магазин
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="home-human-container animate-fade-in" style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={adamImage}
                            className="home-human-image"
                            alt="dracarys fashion"
                            style={{
                                width: '85%',
                                height: 'auto',
                                display: 'block',
                                transition: 'transform 0.5s ease',
                                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>

                    {/* Описание для мобилок - показывается после фото */}
                    <div className="md:hidden animate-fade-in">
                        <p style={{
                            fontSize: '18px',
                            color: '#6e6e73',
                            lineHeight: '1.47',
                            marginBottom: '32px',
                            fontWeight: '400'
                        }}>
                            Мы создаем одежду для тех, кто ищет совершенство в простоте. Каждая вещь dracarys — это баланс между современной эстетикой и бескомпромиссным качеством материалов.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/products')}
                                style={{
                                    padding: '16px 32px',
                                    background: '#0A0A0A',
                                    color: '#FFFFFF',
                                    borderRadius: '100px',
                                    fontWeight: '600',
                                    fontSize: '17px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                Перейти в магазин
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-[#f5f5f7]">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gray">Shop Selected</h3>
                            <h2 className="text-4xl md:text-5xl font-bold text-dark tracking-tight font-sans">Популярные товары</h2>
                        </div>
                        <button
                            onClick={() => navigate('/products')}
                            className="group flex items-center gap-2 text-dark font-bold hover:text-accent transition-colors duration-300"
                        >
                            Смотреть все
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="aspect-[3/4] rounded-apple-lg" />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-apple-xl border border-light">
                            <Package className="w-16 h-16 text-gray-light mx-auto mb-4 opacity-20" />
                            <p className="text-gray font-medium">Пока нет товаров</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="home-stats-section" style={{
                padding: '120px 0',
                background: '#f5f5f7',
                borderRadius: '60px 60px 0 0',
                marginTop: '-40px',
                position: 'relative'
            }}>
                <div className="home-stats-section-container" style={{
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '0 48px'
                }}>
                    <h2 className="home-stats-section-title" style={{
                        fontSize: '64px',
                        fontWeight: '700',
                        lineHeight: '1.05',
                        marginBottom: '32px',
                        color: '#1d1d1f',
                        letterSpacing: '-0.015em',
                        maxWidth: '900px'
                    }}>
                        Почему выбирают нас?
                    </h2>

                    <p style={{
                        fontSize: '21px',
                        color: '#6e6e73',
                        lineHeight: '1.47',
                        marginBottom: '80px',
                        maxWidth: '900px',
                        fontWeight: '400'
                    }}>
                        Нам не интересна прибыль — нам важно сохранить каждого клиента.
                        Для этого мы каждый день развиваемся и стараемся улучшить экосистему,
                        чтобы было удобнее для вас.
                    </p>

                    <div className="home-steps-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '32px'
                    }}>
                        {[
                            {
                                number: '01',
                                icon: crmIcon,
                                title: 'Собственный CRM',
                                description: 'Мы разработали собственную CRM-систему для управления заказами, клиентами и товарами — всё работает быстро и стабильно'
                            },
                            {
                                number: '02',
                                icon: supportIcon,
                                title: 'Поддержка 24/7',
                                description: 'Наши продавцы всегда в сети, даже если заняты — мы разработали собственный ИИ'
                            },
                            {
                                number: '03',
                                icon: securatiyIcon,
                                title: 'Безопасность',
                                description: 'Наша система — полностью зашифрованная закрытая экосистема. Мы никогда не разглашаем информацию о клиентах, так мы сохраняем доверие'
                            }
                        ].map((item: { number: string; icon: string; title: string; description: string }, i: number) => (
                            <div key={i} className="home-step-card" style={{
                                background: '#FFFFFF',
                                padding: '40px',
                                borderRadius: '18px',
                                position: 'relative',
                                overflow: 'hidden',
                                marginBottom: '0',
                                border: '1px solid rgba(0, 0, 0, 0.04)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)'
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)'
                                }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    opacity: 0.1,
                                    transform: 'rotate(15deg)'
                                }}>
                                    <img
                                        src={item.icon}
                                        alt=""
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <div style={{
                                    marginBottom: '20px'
                                }}>
                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <div className="home-step-number" style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#999999',
                                    marginBottom: '20px',
                                    letterSpacing: '1px'
                                }}>
                                    {item.number}
                                </div>
                                <h3 className="home-step-title" style={{
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    color: '#1d1d1f',
                                    marginBottom: '12px',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {item.title}
                                </h3>
                                <p className="home-step-description" style={{
                                    fontSize: '17px',
                                    color: '#6e6e73',
                                    lineHeight: '1.47',
                                    fontWeight: '400'
                                }}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                .mobile-break { display: none; }
                @media (max-width: 768px) {
                    .mobile-break { display: inline; }
                    .home-hero-container { 
                        grid-template-columns: 1fr !important; 
                        gap: 20px !important; 
                        padding: 0 24px !important;
                    }
                    .py-32 { padding-top: 60px; padding-bottom: 60px; }
                    .home-human-image { margin-top: -80px; }

                    /* Stats Section */
                    .home-stats-section {
                        padding: 60px 0 !important;
                    }

                    .home-stats-section-container {
                        padding: 0 20px !important;
                    }

                    .home-stats-section-title {
                        font-size: 36px !important;
                        margin-bottom: 40px !important;
                        letter-spacing: -1px !important;
                    }

                    .home-steps-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }

                    .home-step-card {
                        padding: 32px !important;
                        border-radius: 12px !important;
                    }

                    .home-step-number {
                        font-size: 12px !important;
                        margin-bottom: 16px !important;
                    }

                    .home-step-title {
                        font-size: 22px !important;
                        margin-bottom: 12px !important;
                    }

                    .home-step-description {
                        font-size: 15px !important;
                    }
                }
            `}</style>
        </div>
    );
};
