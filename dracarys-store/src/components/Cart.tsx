import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import { inventoryService, type AvailabilityMap } from '../services/inventoryService';
import { getColorValue, isLightColor } from '../utils/colors';

export const Cart: React.FC = () => {
    const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const total = getTotalPrice();

    useEffect(() => {
        let mounted = true;
        (async () => {
            const avail = await inventoryService.fetchAvailability();
            if (mounted) setAvailability(avail);
        })();
        return () => { mounted = false; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-40 animate-fade-in"
                onClick={toggleCart}
            />

            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-strong z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-light">
                    <h2 className="text-2xl font-semibold text-dark">Корзина</h2>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-light rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-dark" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-gray text-center mb-4">Корзина пуста</p>
                            <Button onClick={toggleCart}>Перейти к покупкам</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-4 bg-light rounded-lg"
                                >
                                    {(() => {
                                        const displayImage = (() => {
                                            if (item.selectedColor && item.color_images?.[item.selectedColor]?.length) {
                                                return item.color_images[item.selectedColor][0];
                                            }
                                            return item.image_url?.split(',')[0];
                                        })();

                                        return (
                                            <img
                                                src={displayImage}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        );
                                    })()}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-dark mb-1">{item.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                            {item.selectedColor && (
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor: getColorValue(item.selectedColor),
                                                            border: isLightColor(getColorValue(item.selectedColor)) ? '1px solid #E5E7EB' : '1px solid rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray">
                                                        Цвет: <span className="text-dark">{item.selectedColor}</span>
                                                    </p>
                                                </div>
                                            )}
                                            {item.selectedSize && (
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray">
                                                    Размер: <span className="text-dark">{item.selectedSize}</span>
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-dark mb-2">
                                            {item.discounted_price && item.discounted_price > 0
                                                ? item.discounted_price.toLocaleString('ru-RU')
                                                : item.price.toLocaleString('ru-RU')} ₸
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                                                className="p-1 hover:bg-white rounded transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-dark" />
                                            </button>
                                            <span className="text-sm font-medium text-dark w-8 text-center">
                                                {item.quantity}
                                            </span>
                                            {(() => {
                                                const maxQty = inventoryService.qtyFor(availability, item.name, item.selectedColor, item.selectedSize);
                                                const canIncrease = maxQty === 0 || item.quantity < maxQty;
                                                return (
                                                    <button
                                                        onClick={() => {
                                                            if (!canIncrease) return;
                                                            updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor);
                                                        }}
                                                        disabled={!canIncrease}
                                                        className={`p-1 rounded transition-colors ${canIncrease ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'}`}
                                                        title={!canIncrease ? 'Достигнут максимум на складе' : ''}
                                                    >
                                                        <Plus className="w-4 h-4 text-dark" />
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors self-start"
                                    >
                                        <Trash2 className="w-5 h-5 text-accent" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-light space-y-4">
                        <div className="flex items-center justify-between text-lg">
                            <span className="font-medium text-dark">Итого:</span>
                            <span className="font-bold text-dark">
                                {total.toLocaleString('ru-RU')} ₸
                            </span>
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => {
                                const message = `Здравствуйте! Хочу оформить заказ в Dracarys Store:\n\n${items.map(item => {
                                    const barcode = item.barcode ? ` (#${item.barcode})` : '';
                                    const variant = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
                                    const variantStr = variant ? ` [${variant}]` : '';
                                    const effectivePrice = item.discounted_price && item.discounted_price > 0 ? item.discounted_price : item.price;
                                    return `- ${item.name}${barcode}${variantStr} x${item.quantity}: ${effectivePrice * item.quantity} ₸`;
                                }).join('\n')}\n\n*Итого: ${total.toLocaleString('ru-RU')} ₸*`;
                                window.open(`https://wa.me/77003714100?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                        >
                            Оформить заказ в WhatsApp
                        </Button>
                        <button
                            onClick={clearCart}
                            className="w-full text-sm text-accent hover:text-accent-hover transition-colors font-bold uppercase tracking-widest py-2"
                        >
                            Очистить корзину
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
