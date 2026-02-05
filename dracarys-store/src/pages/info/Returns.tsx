import React from 'react';
import { SEO } from '../../components/SEO';
import { RotateCcw, ShieldCheck, ClipboardCheck } from 'lucide-react';

export const Returns: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO title="Условия возврата" description="Правила и сроки возврата товаров в магазине Dracarys." />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
                <div className="max-w-4xl mx-auto space-y-16 animate-slide-up">
                    <div className="space-y-6 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-dark tracking-tighter">Условия возврата</h1>
                        <p className="text-xl text-gray font-medium max-w-2xl mx-auto">
                            Мы хотим, чтобы вы были довольны покупкой. Если вещь не подошла, мы поможем её вернуть или обменять.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mx-auto text-dark">
                                <RotateCcw className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold">14 дней для возврата</h3>
                            <p className="text-sm text-gray font-medium">С момента получения заказа у вас есть две недели на принятие решения.</p>
                        </div>
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mx-auto text-dark">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold">Сохранение вида</h3>
                            <p className="text-sm text-gray font-medium">Товар должен быть с бирками, без следов носки и в оригинальной упаковке.</p>
                        </div>
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mx-auto text-dark">
                                <ClipboardCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold">Быстрый возврат средств</h3>
                            <p className="text-sm text-gray font-medium">Мы вернем деньги на вашу карту в течение 3-5 рабочих дней после проверки товара.</p>
                        </div>
                    </div>

                    <div className="space-y-8 prose prose-gray max-w-none">
                        <h2 className="text-3xl font-bold text-dark tracking-tight">Как оформить возврат</h2>
                        <ol className="list-decimal list-inside space-y-4 text-gray font-medium">
                            <li>Свяжитесь с нами через WhatsApp или Email, указав номер заказа.</li>
                            <li>Заполните краткое заявление на возврат (мы пришлем форму).</li>
                            <li>Отправьте товар курьерской службой или принесите в наш шоурум.</li>
                            <li>Ожидайте подтверждения и возврата средств.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
