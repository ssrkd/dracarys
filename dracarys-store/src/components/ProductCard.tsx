import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/database';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { Skeleton } from './ui/Skeleton';
import { capitalizeCategory, formatPrice, hasDiscount } from '../utils/formatters';

interface ProductCardProps {
    product?: Product;
    isLoading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isLoading = false }) => {
    const { addItem } = useCartStore();
    const { addToast } = useToastStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        if (product && product.sizes && product.sizes.length > 0) {
            // Let the Link handle navigation to detail page for size selection
            return;
        }

        e.preventDefault();
        if (product) {
            addItem(product);
            addToast('success', `${product.name} добавлен в корзину`);
        }
    };

    if (isLoading || !product) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="aspect-square bg-gray-light/20" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center mt-2">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-10 w-10 circular" />
                    </div>
                </div>
            </div>
        );
    }

    const showDiscount = hasDiscount(product.discounted_price);

    return (
        <Link to={`/products/${product.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-dark/5 focus:ring-offset-2 rounded-apple transition-all duration-300">
            <div className="bg-white rounded-apple overflow-hidden transition-all duration-500 hover:shadow-apple-xl">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-light">
                    <img
                        src={product.image_url?.split(',')[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 flex flex-col gap-1.5 items-start">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 glass text-[7px] md:text-[9px] uppercase tracking-[0.15em] font-black text-dark rounded-apple-sm shadow-apple-sm">
                            {capitalizeCategory(product.category)}
                        </span>
                        {showDiscount && (
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-danger text-white text-[7px] md:text-[9px] uppercase tracking-[0.15em] font-black rounded-apple-sm shadow-apple-sm">
                                Sale
                            </span>
                        )}
                    </div>

                    {/* Overlay Button (Visible on Hover) */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                            onClick={handleAddToCart}
                            className="px-6 py-2.5 glass text-dark font-bold rounded-full scale-90 group-hover:scale-100 transition-all duration-500 hover:bg-white hover:border-transparent tap-highlight-none active:scale-95 translate-y-4 group-hover:translate-y-0"
                        >
                            {product.sizes && product.sizes.length > 0 ? 'Выбрать размер' : 'В корзину'}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="py-5 px-1 space-y-2">
                    <h2 className="text-[13px] md:text-lg font-semibold md:font-bold text-dark leading-tight group-hover:text-accent transition-colors duration-300 line-clamp-2">
                        {product.name}
                    </h2>

                    {/* Sizes Pills */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 6).map((size) => (
                                <span
                                    key={size}
                                    className="px-2 py-0.5 bg-light text-gray-dark text-[9px] font-black uppercase tracking-wider rounded-full"
                                >
                                    {size}
                                </span>
                            ))}
                            {product.sizes.length > 6 && (
                                <span className="px-2 py-0.5 bg-light text-gray text-[9px] font-black rounded-full">
                                    +{product.sizes.length - 6}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 pt-1">
                        {showDiscount && product.discounted_price ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray line-through">
                                    {formatPrice(product.price)} ₸
                                </span>
                                <span className="text-lg font-bold text-dark">
                                    {formatPrice(product.discounted_price)} ₸
                                </span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-dark">
                                {formatPrice(product.price)} ₸
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
