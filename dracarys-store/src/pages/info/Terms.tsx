import React from 'react';
import { SEO } from '../../components/SEO';

export const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Условия использования" noindex />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
                <div className="max-w-3xl mx-auto space-y-12 animate-slide-up">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-dark tracking-tighter">Условия использования</h1>
                        <p className="text-sm text-gray font-medium uppercase tracking-widest">Последнее обновление: 24 января 2026</p>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-8 font-medium text-gray leading-relaxed">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">1. Общие положения</h2>
                            <p>
                                Используя сайт dracarys.kz, вы соглашаетесь с данными условиями. Мы оставляем за собой право изменять содержание сайта и данные условия в любое время.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">2. Заказы и оплата</h2>
                            <p>
                                Все заказы подлежат подтверждению наличия товара. Цены на сайте указаны в тенге (₸) и могут быть изменены до подтверждения заказа.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">3. Интеллектуальная собственность</h2>
                            <p>
                                Весь контент на сайте (фотографии, тексты, дизайн-код) является собственностью Dracarys и защищен законом об авторском праве. Использование материалов без разрешения запрещено.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-dark">4. Ответственность</h2>
                            <p>
                                Мы стремимся к максимальной точности описаний и фотографий, однако небольшие различия в цветопередаче могут возникать из-за настроек вашего монитора.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
