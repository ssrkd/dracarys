import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductFilter } from '../components/ProductFilter';
import { SearchBar } from '../components/SearchBar';
import { Skeleton } from '../components/ui/Skeleton';
import { Filter, X as CloseIcon } from 'lucide-react';
import { productService } from '../services/productService';
import { useToastStore } from '../store/toastStore';
import type { Product, Category } from '../types/database';
import { SEO } from '../components/SEO';
import { inventoryService, type AvailabilityMap } from '../services/inventoryService';
import dragIcon from '../photo/drag.png';

export const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { addToast } = useToastStore();

    const loadProducts = async () => {
        try {
            const data = await productService.getVisibleProducts();
            setProducts(data);
            // Load availability and store for filtering out-of-stock
            const avail = await inventoryService.fetchAvailability();
            setAvailability(avail);
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

        return () => subscription.unsubscribe();
    }, [addToast]);

    // Hidden auto-refresh every 3s to reflect availability changes (purchases/sales)
    useEffect(() => {
        const id = setInterval(() => {
            loadProducts();
        }, 3000);
        return () => clearInterval(id);
    }, []);

    // Filter products
    useEffect(() => {
        let filtered = [...products];

        if (selectedCategory !== 'All') {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        filtered = filtered.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query)
            );
        }

        // Hide products that are fully out of stock (total availability by name == 0) or all variants are hidden
        const visibleByStock = filtered.filter(p => inventoryService.totalVisibleForProduct(availability, p.name, p.hidden_colors) > 0);
        setFilteredProducts(visibleByStock);
    }, [products, selectedCategory, priceRange, searchQuery, availability]);

    const handleReset = () => {
        setSelectedCategory('All');
        setPriceRange([0, 100000]);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Каталог товаров"
                description="Тщательно отобранные вещи для вашего безупречного стиля. Исследуйте нашу полную коллекцию."
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray mb-12 animate-fade-in">
                    <Link to="/" className="hover:text-dark transition-colors">Главная</Link>
                    <span className="text-gray-light">/</span>
                    <span className="text-dark">Товары</span>
                </div>

                {/* Header */}
                <div className="max-w-3xl mb-20 space-y-6 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <img src={dragIcon} alt="" className="w-12 h-12 object-contain" />
                        <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gray">Full Collection</h3>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold text-dark tracking-tighter leading-tight">
                        Каталог товаров
                    </h2>
                </div>

                {/* Search & Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex items-center justify-between mb-6">
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="flex items-center gap-2 px-6 py-3 bg-light rounded-apple text-xs font-black uppercase tracking-widest text-dark hover:bg-dark hover:text-white transition-all shadow-soft"
                        >
                            {isFiltersOpen ? <CloseIcon className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                            {isFiltersOpen ? 'Закрыть фильтры' : 'Фильтры'}
                        </button>

                        {selectedCategory !== 'All' && (
                            <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                                {selectedCategory}
                            </span>
                        )}
                    </div>

                    {/* Filters - Sidebar */}
                    <aside className={`lg:col-span-3 transition-all duration-500 ease-in-out ${isFiltersOpen
                        ? 'translate-y-0 opacity-100 visible h-auto mb-10'
                        : 'lg:translate-y-0 lg:opacity-100 lg:visible h-0 lg:h-auto opacity-0 invisible overflow-hidden lg:overflow-visible -translate-y-4'
                        }`}>
                        <ProductFilter
                            selectedCategory={selectedCategory}
                            onCategoryChange={(cat) => {
                                setSelectedCategory(cat);
                                if (window.innerWidth < 1024) setIsFiltersOpen(false);
                            }}
                            priceRange={priceRange}
                            onPriceRangeChange={setPriceRange}
                            onReset={() => {
                                handleReset();
                                if (window.innerWidth < 1024) setIsFiltersOpen(false);
                            }}
                        />
                    </aside>

                    {/* Main Grid Area */}
                    <main className="lg:col-span-9 space-y-12">
                        <div className="animate-fade-in delay-200">
                            <SearchBar onSearch={setSearchQuery} />
                        </div>

                        <div>
                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 animate-fade-in">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="space-y-4">
                                            <Skeleton className="aspect-square rounded-apple" />
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-light pb-4">
                                        <p className="text-xs font-black text-gray uppercase tracking-[0.2em]">
                                            Найдено товаров: <span className="text-dark">{filteredProducts.length}</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-12 animate-fade-in">
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-40 glass rounded-apple-xl animate-scale-in">
                                    <div className="max-w-xs mx-auto space-y-6">
                                        <p className="text-2xl font-bold text-dark tracking-tight">Ничего не найдено</p>
                                        <p className="text-sm text-gray font-medium">Попробуйте изменить параметры поиска или фильтры на боковой панели.</p>
                                        <button
                                            onClick={handleReset}
                                            className="px-8 py-3 bg-dark text-white rounded-apple text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                                        >
                                            Сбросить фильтры
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
