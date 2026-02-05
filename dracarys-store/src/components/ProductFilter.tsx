import React from 'react';
import type { Category } from '../types/database';

const categories: Category[] = [
    'All',
    'штаны',
    'куртки | пальто',
    'Футболки',
    'Толстовки и худи',
    'Шапки',
    'Сумки | аксессуары',
    'Обувь'
];

const categoryLabels: Record<Category, string> = {
    All: 'Все',
    'штаны': 'Штаны',
    'куртки | пальто': 'Верхняя одежда',
    'Футболки': 'Футболки',
    'Толстовки и худи': 'Худи и толстовки',
    'Шапки': 'Шапки',
    'Сумки | аксессуары': 'Аксессуары',
    'Обувь': 'Обувь'
};

interface ProductFilterProps {
    selectedCategory: Category;
    onCategoryChange: (category: Category) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    onReset,
}) => {
    return (
        <div className="glass rounded-apple-lg p-8 shadow-soft sticky top-24 border-white/50 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-dark tracking-tight">Фильтры</h3>
                <button
                    onClick={onReset}
                    className="text-sm font-black uppercase tracking-widest text-accent hover:text-accent-hover transition-colors tap-highlight-none"
                >
                    Сброс
                </button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-gray">Категория</h4>
                <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`flex items-center px-4 py-2.5 rounded-apple text-sm font-bold transition-all duration-300 tap-highlight-none ${selectedCategory === category
                                ? 'bg-dark text-white shadow-apple-lg translate-x-1'
                                : 'bg-transparent text-gray hover:bg-black/5 hover:text-dark'
                                }`}
                        >
                            {categoryLabels[category]}
                            {selectedCategory === category && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6">
                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-gray">Цена</h4>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-dark">
                            <span>От</span>
                            <span>{priceRange[0].toLocaleString('ru-RU')} ₸</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={priceRange[0]}
                            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                            className="w-full h-1 bg-light rounded-full appearance-none cursor-pointer accent-dark transition-all"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-dark">
                            <span>До</span>
                            <span>{priceRange[1].toLocaleString('ru-RU')} ₸</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={priceRange[1]}
                            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                            className="w-full h-1 bg-light rounded-full appearance-none cursor-pointer accent-dark transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
