import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { items } = useCartStore();
    const location = useLocation();

    const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const isAdmin = location.pathname.includes('dracarys-admin');

    const navLinks = isAdmin ? [
        { title: 'Товары', path: '/dracarys-admin?tab=products' },
        { title: 'drc ai', path: '/dracarys-admin?tab=ai' },
    ] : [
        { title: 'Главная', path: '/' },
        { title: 'Товары', path: '/products' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'py-3 glass shadow-apple-lg' : 'py-6 bg-transparent'
                }`}
            role="banner"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between" aria-label="Основная навигация">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group tap-highlight-none" aria-label="Dracarys - на главную">
                        <img
                            src="/photo/dracarys.png"
                            alt="dracarys.kz Logo"
                            className="h-[90px] w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const isActive = isAdmin
                                ? (location.pathname + location.search === link.path || (link.path.includes('products') && !location.search))
                                : location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent relative py-2 ${isActive ? 'text-dark' : 'text-gray'}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {link.title}
                                    {isActive && (
                                        <div className="h-1 w-full bg-dark absolute bottom-0 left-0 rounded-full animate-scale-in" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => useCartStore.setState({ isOpen: true })}
                            className={`relative p-3 hover:bg-black/5 rounded-apple transition-all tap-highlight-none active:scale-90 ${isAdmin ? 'hidden' : 'flex'}`}
                            aria-label={`Открыть корзину, товаров: ${cartItemsCount}`}
                        >
                            <ShoppingBag className="w-6 h-6 text-dark" aria-hidden="true" />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center animate-scale-in shadow-apple">
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-3 hover:bg-black/5 rounded-apple transition-all ${isAdmin ? 'hidden' : 'md:hidden flex'}`}
                            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 top-[76px] z-30 bg-white md:hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                aria-hidden={!isMobileMenuOpen}
            >
                <nav className="flex flex-col p-8 gap-8" aria-label="Мобильная навигация">
                    {navLinks.map((link) => {
                        const isActive = isAdmin
                            ? (location.pathname + location.search === link.path || (link.path.includes('products') && !location.search))
                            : location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-4xl font-bold tracking-tighter ${isActive ? 'text-dark' : 'text-gray-light'}`}
                            >
                                {link.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};
