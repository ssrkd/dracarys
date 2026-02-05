import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { Product } from '../types/database';
import { capitalizeCategory, formatPrice, hasDiscount } from '../utils/formatters';
import { inventoryService, type AvailabilityMap } from '../services/inventoryService';
import { getColorValue, isLightColor } from '../utils/colors';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const { addItem } = useCartStore();
    const { addToast } = useToastStore();

    const loadProduct = async () => {
        if (!id) return;

        try {
            const data = await productService.getProductById(id);

            if (!data) {
                addToast('error', 'Товар не найден');
                navigate('/products');
                return;
            }

            setProduct(data);
            const visibleColors = (data.colors || []).filter(c => !data.hidden_colors?.includes(c));
            setSelectedColor(visibleColors[0] || data.color || 'Без цвета');
            const avail = await inventoryService.fetchAvailability();
            setAvailability(avail);

            const related = await productService.getProductsByCategory(data.category);
            const relatedInStock = related
                .filter((p) => p.id !== id)
                .filter((p) => inventoryService.totalForName(avail, p.name) > 0)
                .slice(0, 4);
            setRelatedProducts(relatedInStock);
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            addToast('error', 'Не удалось загрузить товар');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();

        const subscription = productService.subscribeToProducts(() => {
            loadProduct();
        });

        return () => subscription.unsubscribe();
    }, [id, navigate, addToast]);

    const handleAddToCart = () => {
        if (!product) return;

        if (product.colors && product.colors.length > 0 && !selectedColor) {
            addToast('info', 'Пожалуйста, выберите цвет');
            return;
        }

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            addToast('info', 'Пожалуйста, выберите размер');
            return;
        }

        // Enforce per-variant availability
        const maxQty = inventoryService.qtyFor(availability, product.name, selectedColor, selectedSize);
        const existing = useCartStore.getState().items.find(i =>
            i.id === product.id &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor
        );
        const currentQty = existing?.quantity || 0;
        if (maxQty > 0 && currentQty >= maxQty) {
            addToast('info', `Доступно только ${maxQty} шт. для выбранного варианта`);
            return;
        }

        addItem(product, selectedSize, selectedColor);
        addToast('success', `${product.name} успешно добавлен в корзину`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray mb-12 animate-fade-in">
                    <Link to="/" className="hover:text-dark transition-colors">Главная</Link>
                    <span className="text-gray-light">/</span>
                    <Link to="/products" className="hover:text-dark transition-colors">Товары</Link>
                    <span className="text-gray-light">/</span>
                    <span className="text-dark truncate max-w-[150px]">{product.name}</span>
                </div>

                {/* Back button */}
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-dark hover:text-accent transition-colors mb-12 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Назад к каталогу
                </Link>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 mb-32">
                    {/* Images */}
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-light rounded-apple-2xl overflow-hidden shadow-soft">
                            <img
                                src={product.image_url?.split(',')[0]}
                                alt={product.name}
                                id="mainImage"
                                className="w-full aspect-square object-cover"
                            />
                        </div>
                        {/* Thumbnails */}
                        {product.image_url && product.image_url.includes(',') && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {product.image_url.split(',').map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const img = document.getElementById('mainImage') as HTMLImageElement;
                                            if (img) img.src = url;
                                        }}
                                        className="w-24 h-24 rounded-apple overflow-hidden border-2 border-transparent hover:border-dark transition-all flex-shrink-0"
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col animate-slide-up">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="inline-block px-3 py-1 bg-light rounded-full text-[10px] font-black uppercase tracking-widest text-gray-dark">
                                {capitalizeCategory(product.category)}
                            </span>
                            {hasDiscount(product.discounted_price) && (
                                <span className="inline-block px-3 py-1 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Sale
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-dark tracking-tighter mb-4 leading-tight">
                            {product.name}
                        </h1>
                        {hasDiscount(product.discounted_price) && product.discounted_price ? (
                            <div className="flex items-center gap-4 mb-10">
                                <span className="text-2xl font-medium text-gray line-through">
                                    {formatPrice(product.price)} ₸
                                </span>
                                <span className="text-4xl font-bold text-dark">
                                    {formatPrice(product.discounted_price)} ₸
                                </span>
                            </div>
                        ) : (
                            <p className="text-4xl font-bold text-dark mb-10">
                                {formatPrice(product.price)} ₸
                            </p>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray">Выберите цвет</h3>
                                    {selectedColor && <span className="text-xs font-black text-dark uppercase tracking-widest">Выбрано: {selectedColor}</span>}
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {product.colors
                                        .filter(c => !product.hidden_colors?.includes(c))
                                        .map(c => {
                                            const colorValue = getColorValue(c);
                                            const isSelected = selectedColor === c;
                                            const hasStock = inventoryService.qtyFor(availability, product.name, c) > 0;

                                            return (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setSelectedColor(c);
                                                        setSelectedSize(''); // Reset size on color change
                                                    }}
                                                    className={`group relative flex flex-col items-center gap-2 outline-none ${!hasStock ? 'opacity-40 grayscale' : ''}`}
                                                    title={!hasStock ? 'Нет в наличии' : c}
                                                >
                                                    <div className={`w-12 h-12 rounded-full border-2 transition-all p-1 ${isSelected ? 'border-dark' : 'border-transparent group-hover:border-gray-light'}`}>
                                                        <div
                                                            className="w-full h-full rounded-full shadow-inner"
                                                            style={{
                                                                backgroundColor: colorValue,
                                                                border: isLightColor(colorValue) ? '1px solid #E5E7EB' : '1px solid rgba(0,0,0,0.05)'
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-dark' : 'text-gray'}`}>
                                                        {c}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Legacy Color Display */}
                        {!product.colors?.length && product.color && (
                            <div className="mb-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цвет</h3>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{
                                            backgroundColor: getColorValue(product.color),
                                            border: isLightColor(getColorValue(product.color)) ? '1px solid #E5E7EB' : '1px solid rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <p className="text-xl font-bold text-dark">{product.color}</p>
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {(() => {
                            // Combine sizes from DB and sizes with actual stock for the SELECTED COLOR
                            const colorKey = selectedColor || 'Без цвета';
                            const stockSizes = availability[product.name.trim()]?.[colorKey]
                                ? Object.entries(availability[product.name.trim()][colorKey])
                                    .filter(([_, qty]) => qty > 0)
                                    .map(([s]) => s)
                                : [];

                            const allSizes = Array.from(new Set([...(product.sizes || []), ...stockSizes]));
                            const hasSizes = allSizes.length > 0;

                            if (!hasSizes) return null;

                            return (
                                <div className="mb-10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray">Выберите размер</h3>
                                        {selectedSize && <span className="text-xs font-black text-dark uppercase tracking-widest">Выбрано: {selectedSize}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {allSizes
                                            .sort((a, b) => {
                                                const sizeOrder = ['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                                                const aIndex = sizeOrder.indexOf(a);
                                                const bIndex = sizeOrder.indexOf(b);
                                                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                                return a.localeCompare(b);
                                            })
                                            .map(size => {
                                                const qty = inventoryService.qtyFor(availability, product.name, selectedColor, size);
                                                const disabled = qty <= 0;
                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => !disabled && setSelectedSize(size)}
                                                        disabled={disabled}
                                                        className={`min-w-[50px] h-12 flex items-center justify-center rounded-apple border-2 font-black text-xs transition-all ${selectedSize === size
                                                            ? 'bg-dark border-dark text-white'
                                                            : disabled ? 'bg-light border-light text-gray/50 cursor-not-allowed' : 'bg-white border-light text-gray hover:border-dark'
                                                            }`}
                                                        title={disabled ? 'Нет в наличии' : ''}
                                                    >
                                                        {size}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray mb-3">Описание</h3>
                                <p className="text-lg text-gray leading-relaxed font-medium">
                                    {product.description}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-16 text-lg font-black uppercase tracking-widest"
                                onClick={handleAddToCart}
                            >
                                <ShoppingBag className="w-5 h-5 mr-3" />
                                Добавить в корзину
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="animate-fade-in delay-500">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gray">More to look</h3>
                                <h2 className="text-3xl font-bold text-dark tracking-tight">Похожие товары</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
