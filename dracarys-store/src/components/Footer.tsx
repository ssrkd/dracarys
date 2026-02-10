import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, MessageCircle, Music2 } from 'lucide-react';

export const Footer: React.FC = () => {
    const location = useLocation();
    const isAdmin = location.pathname.includes('dracarys-admin');

    const links = isAdmin ? [
        { title: 'Товары', path: '/dracarys-admin?tab=products' },
        { title: 'Управление', path: '/dracarys-admin?tab=ai' },
    ] : [
        { title: 'Главная', path: '/' },
        { title: 'Каталог', path: '/products' },
    ];

    return (
        <footer className="bg-light/30 border-t border-light py-20" role="contentinfo">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center group" aria-label="Dracarys - на главную">
                            <img
                                src="/photo/drcxcrm.png"
                                alt="Dracarys Logo"
                                className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </Link>
                        <p className="text-gray-dark font-black uppercase tracking-widest text-[10px]">
                            Создаем будущее
                        </p>
                        <nav className="flex gap-4" aria-label="Социальные сети">
                            <a href="https://wa.me/77003714100" className="p-2 bg-white rounded-full shadow-soft hover:shadow-apple transition-all hover:scale-110" aria-label="WhatsApp">
                                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="https://instagram.com/dracarys.kz" className="p-2 bg-white rounded-full shadow-soft hover:shadow-apple transition-all hover:scale-110" aria-label="Instagram">
                                <Instagram className="w-5 h-5" aria-hidden="true" />
                            </a>
                            <a href="https://tiktok.com/@dracarys.kz" className="p-2 bg-white rounded-full shadow-soft hover:shadow-apple transition-all hover:scale-110" aria-label="TikTok">
                                <Music2 className="w-5 h-5" aria-hidden="true" />
                            </a>
                        </nav>
                    </div>

                    {/* Links */}
                    <nav className="space-y-6" aria-label="Навигация в футере">
                        <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-gray">Навигация</h4>
                        <ul className="space-y-4">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm font-bold text-dark hover:text-accent transition-colors">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Support */}
                    <nav className="space-y-6" aria-label="Поддержка и помощь">
                        <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-gray">Поддержка</h4>
                        <ul className="space-y-4">
                            <li><Link to="/help" className="text-sm font-bold text-dark hover:text-accent transition-colors">Помощь</Link></li>
                            <li><Link to="/shipping" className="text-sm font-bold text-dark hover:text-accent transition-colors">Доставка</Link></li>
                            {/* <li><Link to="/returns" className="text-sm font-bold text-dark hover:text-accent transition-colors">Возврат</Link></li> */}
                        </ul>
                    </nav>
                </div>

                <div className="mt-20 pt-10 border-t border-light flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold text-gray uppercase tracking-widest">
                        © 2026 Dracarys. Все права защищены.
                    </p>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray hover:text-dark transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray hover:text-dark transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
