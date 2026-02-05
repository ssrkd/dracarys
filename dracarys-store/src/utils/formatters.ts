export const capitalizeCategory = (category: string): string => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
};

export const formatPrice = (price: number): string => {
    if (price === undefined || price === null || isNaN(price)) return '0';
    // Add non-breaking spaces for thousands separator
    return price.toLocaleString('ru-RU').replace(/\s/g, '\u00A0');
};

export const hasDiscount = (discountedPrice?: number | null): boolean => {
    return !!discountedPrice && discountedPrice > 0;
};

export const formatPriceRange = (originalPrice: number, discountedPrice: number): string => {
    // Format without thousand separators for discount prices
    return `${originalPrice} ₸ – ${discountedPrice} ₸`;
};
