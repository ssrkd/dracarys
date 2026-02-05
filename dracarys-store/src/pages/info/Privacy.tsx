import React from 'react';
import { SEO } from '../../components/SEO';

export const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Политика конфиденциальности" noindex />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
                <div className="max-w-3xl mx-auto space-y-12 animate-slide-up">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-dark tracking-tighter">Политика конфиденциальности</h1>
                        <p className="text-sm text-gray font-medium uppercase tracking-widest">Последнее обновление: 24 января 2026</p>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-8 font-medium text-gray leading-relaxed">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">1. Сбор информации</h2>
                            <p>
                                Мы собираем только те данные, которые необходимы для обработки вашего заказа: имя, номер телефона, адрес доставки и электронную почту.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">2. Использование данных</h2>
                            <p>
                                Ваши данные используются исключительно для выполнения доставки, связи с вами по поводу заказа и (с вашего согласия) для информирования о новых коллекциях.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">3. Защита данных</h2>
                            <p>
                                Мы принимаем все необходимые технические и организационные меры для защиты вашей личной информации от несанкционированного доступа.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">4. Третьи лица</h2>
                            <p>
                                Мы передаем ваши данные только службам доставки, непосредственно участвующим в исполнении вашего заказа. Мы никогда не продаем ваши данные сторонним организациям.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
