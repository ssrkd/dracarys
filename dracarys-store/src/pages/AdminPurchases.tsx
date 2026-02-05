import React, { useState, useEffect } from 'react';
import { Package, Plus, Check, X, Trash2 } from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { productService } from '../services/productService';
import type { Purchase } from '../types/database';
import { useToastStore } from '../store/toastStore';
import { formatPrice } from '../utils/formatters';

export const AdminPurchases: React.FC = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToastStore();

    // Add purchase form state
    const [newPurchase, setNewPurchase] = useState({
        name: '',
        size: '',
        quantity: 1,
        purchase_price: '',
        source_app: 1,
        category: '',
        photo_url: ''
    });

    // Order arrival modal state
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [deliveryCost, setDeliveryCost] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [step, setStep] = useState<'delivery' | 'decision' | 'price'>('delivery');

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        setIsLoading(true);
        try {
            const data = await purchaseService.getAllPurchases();
            setPurchases(data);
        } catch (error) {
            console.error('Error loading purchases:', error);
            addToast('error', 'Ошибка загрузки закупок');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Создаём сразу как 'arrived', чтобы не попадало в "Закупки в работе"
            await purchaseService.createArrivedPurchase({
                name: newPurchase.name,
                size: newPurchase.size,
                quantity: newPurchase.quantity,
                purchase_price: parseInt(newPurchase.purchase_price),
                source_app: newPurchase.source_app,
                category: newPurchase.category,
                photo_url: newPurchase.photo_url || undefined
            });
            addToast('success', 'Закупка добавлена');
            setNewPurchase({
                name: '',
                size: '',
                quantity: 1,
                purchase_price: '',
                source_app: 1,
                category: '',
                photo_url: ''
            });
            loadPurchases();
        } catch (error) {
            addToast('error', 'Ошибка при добавлении');
        }
    };

    const handleOrderArrived = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setStep('delivery');
        setDeliveryCost('');
        setSellingPrice('');
    };

    const handleDeliverySubmit = async () => {
        if (!selectedPurchase || !deliveryCost) return;

        try {
            const updatedPurchase = await purchaseService.updatePurchaseStatus(
                selectedPurchase.id,
                'arrived',
                parseInt(deliveryCost)
            );
            setSelectedPurchase(updatedPurchase);
            setStep('decision');
        } catch (error) {
            addToast('error', 'Ошибка при обновлении');
        }
    };

    const handleListForSale = () => {
        setStep('price');
    };

    const handleArchive = async () => {
        if (!selectedPurchase) return;

        try {
            await purchaseService.archivePurchase(selectedPurchase.id);
            addToast('success', 'Закупка архивирована');
            setSelectedPurchase(null);
            loadPurchases();
        } catch (error) {
            addToast('error', 'Ошибка при архивировании');
        }
    };

    const handleCreateProduct = async () => {
        if (!selectedPurchase || !sellingPrice) return;

        try {
            // Create product from purchase
            await productService.createFromPurchase(
                {
                    name: selectedPurchase.name,
                    size: selectedPurchase.size,
                    category: selectedPurchase.category,
                    photo_url: selectedPurchase.photo_url
                },
                parseInt(sellingPrice),
                selectedPurchase.total_cost || selectedPurchase.purchase_price
            );

            // Update purchase status to listed
            await purchaseService.updatePurchaseStatus(selectedPurchase.id, 'listed');

            addToast('success', 'Товар выставлен в продажу');
            setSelectedPurchase(null);
            loadPurchases();
        } catch (error) {
            addToast('error', 'Ошибка при создании товара');
        }
    };

    const handleDeletePurchase = async (id: string) => {
        if (!confirm('Удалить эту закупку?')) return;

        try {
            await purchaseService.deletePurchase(id);
            addToast('success', 'Закупка удалена');
            loadPurchases();
        } catch (error) {
            addToast('error', 'Ошибка при удалении');
        }
    };

    if (isLoading) return <div className="py-20 text-center text-gray">Загрузка закупок...</div>;

    const pendingPurchases = purchases.filter(p => p.status === 'pending');

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Add Purchase Form */}
            <div className="bg-white p-10 rounded-apple-xl shadow-apple-lg border border-light">
                <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-accent" />
                    Добавить закупку
                </h3>
                <form onSubmit={handleAddPurchase} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название товара</label>
                            <input
                                type="text"
                                value={newPurchase.name}
                                onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Размер</label>
                            <input
                                type="text"
                                value={newPurchase.size}
                                onChange={(e) => setNewPurchase({ ...newPurchase, size: e.target.value })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Количество</label>
                            <input
                                type="number"
                                value={newPurchase.quantity}
                                onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена закупки (₸)</label>
                            <input
                                type="number"
                                value={newPurchase.purchase_price}
                                onChange={(e) => setNewPurchase({ ...newPurchase, purchase_price: e.target.value })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Приложение</label>
                            <select
                                value={newPurchase.source_app}
                                onChange={(e) => setNewPurchase({ ...newPurchase, source_app: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                            >
                                <option value={1}>Приложение 1</option>
                                <option value={2}>Приложение 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Категория</label>
                            <input
                                type="text"
                                value={newPurchase.category}
                                onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Фото URL (опционально)</label>
                        <input
                            type="text"
                            value={newPurchase.photo_url}
                            onChange={(e) => setNewPurchase({ ...newPurchase, photo_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full h-14 bg-dark text-white rounded-apple font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Добавить закупку
                    </button>
                </form>
            </div>

            {/* Pending Purchases */}
            {pendingPurchases.length > 0 && (
                <div className="bg-white rounded-apple-xl overflow-hidden border border-light shadow-apple">
                    <div className="p-6 border-b border-light">
                        <h3 className="font-bold text-dark flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray" />
                            Ожидают прибытия ({pendingPurchases.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Товар</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Размер</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Цена</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Источник</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light">
                                {pendingPurchases.map(purchase => (
                                    <tr key={purchase.id} className="hover:bg-light/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-dark">{purchase.name}</p>
                                            <p className="text-[10px] text-gray uppercase font-bold">{purchase.category}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-light rounded text-[10px] font-black text-gray-dark">{purchase.size}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-bold text-sm text-dark">{formatPrice(purchase.purchase_price)} ₸</p>
                                            <p className="text-[9px] text-gray font-bold">× {purchase.quantity}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray uppercase">Прил. {purchase.source_app}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOrderArrived(purchase)}
                                                className="px-4 py-2 bg-accent text-white rounded-apple text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                Пришёл заказ
                                            </button>
                                            <button
                                                onClick={() => handleDeletePurchase(purchase.id)}
                                                className="p-2 text-gray hover:text-danger transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Arrival Modal */}
            {selectedPurchase && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-apple-xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold text-dark mb-6">Заказ прибыл: {selectedPurchase.name}</h3>

                        {step === 'delivery' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                        Сколько стоила доставка?
                                    </label>
                                    <input
                                        type="number"
                                        value={deliveryCost}
                                        onChange={(e) => setDeliveryCost(e.target.value)}
                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <div className="p-4 bg-light rounded-apple">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray mb-2">Итого себестоимость:</p>
                                    <p className="text-2xl font-bold text-dark">
                                        {formatPrice(selectedPurchase.purchase_price + (parseInt(deliveryCost) || 0))} ₸
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedPurchase(null)}
                                        className="flex-1 h-12 bg-light text-dark rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleDeliverySubmit}
                                        disabled={!deliveryCost}
                                        className="flex-1 h-12 bg-dark text-white rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        Далее
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'decision' && (
                            <div className="space-y-6">
                                <p className="text-sm font-medium text-gray">Выставить в продажу?</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleArchive}
                                        className="flex-1 h-14 bg-light text-dark rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Нет
                                    </button>
                                    <button
                                        onClick={handleListForSale}
                                        className="flex-1 h-14 bg-accent text-white rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        Да
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'price' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                        За какую цену выставить?
                                    </label>
                                    <input
                                        type="number"
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                {sellingPrice && selectedPurchase.total_cost && (
                                    <div className="p-4 bg-light rounded-apple">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray mb-2">Прогноз прибыли:</p>
                                        <p className="text-2xl font-bold text-accent">
                                            +{formatPrice(parseInt(sellingPrice) - selectedPurchase.total_cost)} ₸
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('decision')}
                                        className="flex-1 h-12 bg-light text-dark rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        onClick={handleCreateProduct}
                                        disabled={!sellingPrice}
                                        className="flex-1 h-12 bg-dark text-white rounded-apple font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        Выставить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
