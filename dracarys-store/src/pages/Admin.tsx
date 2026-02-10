import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package, Upload, Check, Loader2, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { productService } from '../services/productService';
import { purchaseService } from '../services/purchaseService';
import { useToastStore } from '../store/toastStore';
import type { Product, Category } from '../types/database';
import { SEO } from '../components/SEO';
import { capitalizeCategory, formatPrice, hasDiscount } from '../utils/formatters';
import { AdminAI } from './AdminAI';

interface ProductFormData {
    name: string;
    category: string;
    price: string;
    description: string;
    image_url: string;
    images: string[];
    sizes: string[];
    featured: boolean;
    discounted_price: string; // Actual discounted price (not percentage)
}

const CATEGORIES: Category[] = [
    'штаны',
    'куртки | пальто',
    'Футболки',
    'Толстовки и худи',
    'Шапки',
    'Сумки | аксессуары',
    'Обувь'
];

const AVAILABLE_SIZES = [
    'стандарт',
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'
];

export const Admin: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'ai'>((searchParams.get('tab') as 'products' | 'ai') || 'products');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'products' || tab === 'ai') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'products' | 'ai') => {
        setSearchParams({ tab });
        setActiveTab(tab);
    };

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        category: '',
        price: '',
        description: '',
        image_url: '',
        images: [],
        sizes: [],
        featured: false,
        discounted_price: '',
    });

    const { addToast } = useToastStore();

    const loadProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            addToast('error', 'Не удалось загрузить товары');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();

        const subscription = productService.subscribeToProducts(() => {
            loadProducts();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Hidden auto-refresh every 3s
    useEffect(() => {
        const id = setInterval(() => {
            loadProducts();
        }, 3000);
        return () => clearInterval(id);
    }, []);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price.toString(),
                description: product.description,
                image_url: product.image_url,
                images: product.image_url ? product.image_url.split(',').filter(Boolean) : (product.images || []),
                sizes: product.sizes || [],
                featured: product.featured || false,
                discounted_price: product.discounted_price?.toString() || '',
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                price: '',
                description: '',
                image_url: '',
                images: [],
                sizes: [],
                featured: false,
                discounted_price: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Валидация размера (макс 2MB на файл)
        for (const file of Array.from(files)) {
            if (file.size > 2 * 1024 * 1024) {
                addToast('error', 'Файл слишком большой (макс 2MB)');
                return;
            }
        }

        setIsUploading(true);
        try {
            const uploaded: string[] = [];
            for (const file of Array.from(files)) {
                const publicUrl = await productService.uploadImage(file);
                uploaded.push(publicUrl);
            }
            setFormData(prev => ({
                ...prev,
                image_url: prev.image_url || uploaded[0],
                images: [...prev.images, ...uploaded]
            }));
            addToast('success', `${uploaded.length} фото загружено`);
        } catch (error: any) {
            console.error('Ошибка загрузки фото:', error);
            const message = error.message || 'Неизвестная ошибка';
            addToast('error', `Ошибка загрузки: ${message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image_url) {
            addToast('error', 'Пожалуйста, загрузите фото товара');
            return;
        }

        setIsSubmitting(true);

        try {
            const productData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                description: formData.description,
                image_url: formData.images.length > 0 ? formData.images.join(',') : formData.image_url,
                images: formData.images,
                sizes: formData.sizes,
                featured: formData.featured,
                discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
                addToast('success', 'Товар успешно обновлен');
            } else {
                await productService.createProduct(productData);
                addToast('success', 'Товар успешно создан');
            }

            // Мгновенное обновление для текущего пользователя
            loadProducts();
            handleCloseModal();
        } catch (error: any) {
            console.error('Ошибка сохранения товара:', error);
            if (error.message?.includes('column "sizes" does not exist')) {
                addToast('error', 'Ошибка БД: Колонка "sizes" не найдена. См. SUPABASE_PATCH.md');
            } else {
                addToast('error', `Не удалось сохранить: ${error.message || 'ошибка сервера'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: string, name: string) => {
        setProductToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsSubmitting(true);

        try {
            await productService.deleteProduct(productToDelete.id);
            // Also clean up unlisted purchases (pending/arrived) for this product name so склад не показывает остатки
            try {
                await purchaseService.deleteUnlistedByName(productToDelete.name);
            } catch (e) {
                // Ignore cleanup errors, continue
            }
            addToast('success', 'Товар успешно удален');
            loadProducts(); // Мгновенное обновление
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            addToast('error', 'Не удалось удалить товар');
        } finally {
            setIsSubmitting(false);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const handleToggleVisibility = async (id: string) => {
        try {
            await productService.toggleVisibility(id);
            addToast('success', 'Видимость обновлена');
            loadProducts();
        } catch (error) {
            console.error('Ошибка переключения видимости:', error);
            addToast('error', 'Не удалось обновить видимость');
        }
    };

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handleNameChange = (val: string) => {
        const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
        setFormData({ ...formData, name: capitalized });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <SEO title="Админ-панель" noindex />
            <div className="w-full 2xl:max-w-none py-12 md:py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 animate-slide-up pl-4 sm:pl-8 lg:pl-12">
                    <div className="space-y-4 mt-12 md:mt-0">
                        <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gray">Management Cloud</h3>
                        <h1 className="text-5xl font-bold text-dark tracking-tighter">
                            {activeTab === 'products' ? 'Admin Panel' : 'Management'}
                        </h1>
                        <div className="flex items-center gap-4 mt-4">
                            <button
                                onClick={() => handleTabChange('products')}
                                className={`text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-full transition-all ${activeTab === 'products' ? 'bg-dark text-white' : 'text-gray hover:bg-light'
                                    }`}
                            >
                                Товары
                            </button>
                            <button
                                onClick={() => handleTabChange('ai')}
                                className={`text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-full transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-accent text-white shadow-apple' : 'text-gray hover:bg-light'
                                    }`}
                            >
                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                                Управление
                            </button>
                        </div>
                    </div>
                    {activeTab === 'products' && (
                        <Button onClick={() => handleOpenModal()} className="h-12 px-8 font-bold">
                            <Plus className="w-5 h-5 mr-2" />
                            Добавить товар
                        </Button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    <>
                        {/* Search and Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                            <div className="lg:col-span-3">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray transition-colors group-focus-within:text-dark" />
                                    <input
                                        type="text"
                                        placeholder="Поиск по названию или категории..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-light border-2 border-transparent rounded-apple text-dark placeholder-gray/50 focus:outline-none focus:bg-white focus:border-dark/5 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="glass rounded-apple p-4 flex items-center justify-between border-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-dark text-white rounded-apple flex items-center justify-center">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray">Всего товаров</p>
                                        <p className="text-xl font-bold text-dark leading-none">{products.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="glass rounded-apple-lg shadow-soft overflow-hidden border-white/50 animate-fade-in delay-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-light/50 border-b border-light">
                                            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-gray">Изображение</th>
                                            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-gray">Информация</th>
                                            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-gray">Категория</th>
                                            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-gray">Цена</th>
                                            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-gray text-right">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-light">
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-8 py-6"><Skeleton className="w-16 h-16 rounded-xl" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-3 w-64" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-8 py-6"><div className="flex justify-end gap-2"><Skeleton className="w-10 h-10 rounded-lg" /><Skeleton className="w-10 h-10 rounded-lg" /></div></td>
                                                </tr>
                                            ))
                                        ) : filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-light/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="w-16 h-16 rounded-apple overflow-hidden bg-light shadow-soft transition-transform group-hover:scale-105">
                                                            <img
                                                                src={product.image_url?.split(',')[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 max-w-md">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-bold text-dark">{product.name}</p>
                                                            {product.featured && (
                                                                <Star className="w-4 h-4 text-accent fill-current" />
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1 mb-1">
                                                            {(product.sizes || []).map(s => (
                                                                <span key={s} className="text-[8px] font-black border border-gray/20 px-1 rounded uppercase">{s}</span>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray line-clamp-1">{product.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-light text-gray-dark text-[10px] uppercase tracking-widest font-bold rounded-full border border-gray-light/30">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-dark">
                                                        {hasDiscount(product.discounted_price) && product.discounted_price ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-gray text-[10px] line-through opacity-60">
                                                                    {formatPrice(product.price)} ₸
                                                                </span>
                                                                <span className="text-accent">{formatPrice(product.discounted_price)} ₸</span>
                                                            </div>
                                                        ) : (
                                                            <span>{formatPrice(product.price)} ₸</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => handleOpenModal(product)}
                                                                className="p-2.5 hover:bg-dark hover:text-white rounded-xl transition-all duration-300 shadow-soft hover:shadow-apple active:scale-90"
                                                                title="Редактировать"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleVisibility(product.id)}
                                                                className={`p-2.5 rounded-xl transition-all duration-300 shadow-soft hover:shadow-apple active:scale-90 ${!(product.is_visible ?? true) ? 'bg-gray text-white hover:bg-dark' : 'bg-light hover:bg-dark hover:text-white'}`}
                                                                title={(product.is_visible ?? true) ? 'Скрыть от покупателей' : 'Показать покупателям'}
                                                            >
                                                                {(product.is_visible ?? true) ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(product.id, product.name)}
                                                                className="p-2.5 hover:bg-accent hover:text-white rounded-xl transition-all duration-300 shadow-soft hover:shadow-apple active:scale-90"
                                                                title="Удалить"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center text-gray">
                                                    По данному запросу товаров не найдено
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </>
                ) : (
                    <AdminAI />
                )}

                {/* Product Form Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProduct ? 'Редактировать товар' : 'Новое поступление'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название товара</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Напр: Шапка бини"
                                    required
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark placeholder-gray/50 focus:outline-none focus:bg-white focus:border-dark transition-all text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Категория</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:outline-none focus:bg-white focus:border-dark transition-all text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Выберите категорию</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{capitalizeCategory(cat)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Цена (₸)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Фото товара</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full px-4 py-3 bg-light border-2 border-dashed border-gray-light/50 rounded-apple text-dark text-left focus:outline-none hover:bg-white hover:border-dark transition-all text-sm font-bold flex items-center justify-between group disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2">
                                        {isUploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                        ) : (
                                            <Upload className="w-5 h-5 text-gray group-hover:text-dark" />
                                        )}
                                        {formData.images.length > 0 ? 'Добавить ещё фото' : 'Загрузить с устройства'}
                                    </span>
                                    {formData.images.length > 0 && <Check className="w-5 h-5 text-success" />}
                                </button>

                                {formData.images.length > 0 && (
                                    <div className="mt-4 flex gap-3 flex-wrap">
                                        {formData.images.map((url, idx) => (
                                            <div key={idx} className="relative w-20 h-20 rounded-apple overflow-hidden border-2 border-light shadow-soft group">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4 text-danger" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Featured & Discount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Избранный товар</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                                    className={`w-full px-4 py-3 rounded-apple text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${formData.featured
                                        ? 'bg-dark border-dark text-white'
                                        : 'bg-light border-light text-gray hover:border-dark'
                                        }`}
                                >
                                    <Star className={`w-5 h-5 ${formData.featured ? 'fill-current' : ''}`} />
                                    {formData.featured ? 'Показывать на главной' : 'Не на главной'}
                                </button>
                            </div>
                            <Input
                                label="Цена со скидкой (₸)"
                                type="number"
                                min="0"
                                value={formData.discounted_price}
                                onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                                placeholder="Оставьте пустым, если нет скидки"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Доступные размеры</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SIZES.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleSize(size)}
                                        className={`px-3 py-2 rounded-apple text-xs font-black transition-all border-2 ${formData.sizes.includes(size)
                                            ? 'bg-dark border-dark text-white shadow-apple'
                                            : 'bg-white border-light text-gray hover:border-dark'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                Описание товара
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark placeholder-gray/50 focus:outline-none focus:bg-white focus:border-dark transition-all text-sm font-medium resize-none min-h-[100px]"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-light">
                            <Button type="submit" isLoading={isSubmitting} className="flex-1 h-12 font-bold transform active:scale-95 transition-transform">
                                {editingProduct ? 'Сохранить изменения' : 'Опубликовать товар'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="px-8 h-12 font-bold"
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Подтверждение удаления"
                    size="sm"
                >
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-bold text-dark tracking-tight">Вы уверены?</p>
                            <p className="text-sm text-gray font-medium">
                                Товар <span className="text-dark font-black underline">"{productToDelete?.name}"</span> будет удален безвозвратно.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                isLoading={isSubmitting}
                                className="h-12 font-bold"
                            >
                                Удалить
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isSubmitting}
                                className="h-12 font-bold"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div >
    );
};
