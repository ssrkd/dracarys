import React from 'react';
import { SEO } from '../../components/SEO';
import { Truck, MapPin, Clock, PackageCheck } from 'lucide-react';

export const Shipping: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Доставка" description="Информация о способах и сроках доставки заказов Dracarys по Казахстану и России." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
                <div className="max-w-4xl mx-auto space-y-20 animate-slide-up">
                    <div className="space-y-6 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-dark tracking-tighter">Доставка</h1>
                        <p className="text-xl text-gray font-medium max-w-2xl mx-auto">
                            Мы доставляем наши заказы по всему Казахстану и России. Быстро и надежно.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-light rounded-apple-xl space-y-4">
                            <div className="w-12 h-12 bg-dark text-white rounded-apple flex items-center justify-center">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-dark">Доставка по РК</h3>
                            <p className="text-gray font-medium">Осуществляется через Казпочту или СДЭК. Срок доставки: 3-7 рабочих дней.</p>
                        </div>

                        <div className="p-8 bg-light rounded-apple-xl space-y-4">
                            <div className="w-12 h-12 bg-dark text-white rounded-apple flex items-center justify-center">
                                <PackageCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-dark">Доставка в РФ</h3>
                            <p className="text-gray font-medium">Осуществляется через курьерскую службу СДЭК. Срок доставки зависит от региона.</p>
                        </div>

                        <div className="p-8 bg-light rounded-apple-xl space-y-4">
                            <div className="w-12 h-12 bg-dark text-white rounded-apple flex items-center justify-center">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-dark">Локация</h3>
                            <p className="text-gray font-medium">Мы — онлайн-магазин. Наш магазин находится в Астане. Доступна только курьерская доставка или отправка почтой.</p>
                        </div>

                        <div className="p-8 bg-light rounded-apple-xl space-y-4">
                            <div className="w-12 h-12 bg-dark text-white rounded-apple flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-dark">Сроки обработки</h3>
                            <p className="text-gray font-medium">Все заказы обрабатываются и передаются в службу доставки в течение 24-48 часов после подтверждения.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-dark tracking-tight">Как мы упаковываем заказы</h2>
                        <p className="text-xl text-gray leading-relaxed font-medium">
                            Каждый заказ в dracarys упаковывается с особой заботой. Мы используем прочные материалы, чтобы ваши вещи доехали в идеальном состоянии.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
