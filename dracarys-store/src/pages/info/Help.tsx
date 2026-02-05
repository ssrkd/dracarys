import React from 'react';
import { SEO } from '../../components/SEO';
import { Mail, Phone, MessageSquare } from 'lucide-react';

export const Help: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Центр поддержки" description="Помощь и часто задаваемые вопросы о магазине Dracarys." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
                <div className="max-w-4xl mx-auto space-y-20 animate-slide-up">
                    {/* Header */}
                    <div className="space-y-6 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-dark tracking-tighter">Центр поддержки</h1>
                        <p className="text-xl text-gray font-medium max-w-2xl mx-auto">
                            Мы здесь, чтобы помочь вам с любыми вопросами о ваших заказах, товарах или работе сервиса.
                        </p>
                    </div>

                    {/* FAQ Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-dark">Как сделать заказ?</h3>
                            <p className="text-gray leading-relaxed font-medium">
                                Выберите понравившийся товар, укажите размер и добавьте его в корзину. Перейдите в корзину и следуйте инструкциям для оформления.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-dark">Сколько длится доставка?</h3>
                            <p className="text-gray leading-relaxed font-medium">
                                Стандартная доставка занимает от 3 до 7 рабочих дней в зависимости от вашего региона.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-dark">Можно ли отменить заказ?</h3>
                            <p className="text-gray leading-relaxed font-medium">
                                Вы можете отменить заказ в течение 2 часов после оформления, связавшись с нашей службой поддержки.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-dark">Как отследить заказ?</h3>
                            <p className="text-gray leading-relaxed font-medium">
                                После отправки заказа вы получите письмо с трек-номером для отслеживания посылки на сайте службы доставки.
                            </p>
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="glass rounded-apple-xl p-8 md:p-12 text-center space-y-8">
                        <h2 className="text-3xl font-bold text-dark tracking-tight">Все еще есть вопросы?</h2>
                        <p className="text-gray font-medium">Свяжитесь с нашей командой поддержки напрямую.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <a href="mailto:support@dracarys.store" className="p-6 bg-white rounded-apple shadow-soft hover:shadow-apple transition-all group">
                                <Mail className="w-8 h-8 mx-auto mb-4 text-gray group-hover:text-dark transition-colors" />
                                <span className="block text-sm font-bold text-dark">Email</span>
                                <span className="block text-xs text-gray mt-1">support@dracarys.store</span>
                            </a>
                            <a href="tel:+77777777777" className="p-6 bg-white rounded-apple shadow-soft hover:shadow-apple transition-all group">
                                <Phone className="w-8 h-8 mx-auto mb-4 text-gray group-hover:text-dark transition-colors" />
                                <span className="block text-sm font-bold text-dark">Телефон</span>
                                <span className="block text-xs text-gray mt-1">+7 (777) 777-77-77</span>
                            </a>
                            <a href="https://wa.me/77777777777" className="p-6 bg-white rounded-apple shadow-soft hover:shadow-apple transition-all group">
                                <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray group-hover:text-dark transition-colors" />
                                <span className="block text-sm font-bold text-dark">WhatsApp</span>
                                <span className="block text-xs text-gray mt-1">Написать в чат</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
