import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types/database';

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, size?: string) => void;
    removeItem: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, size?: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, size) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === product.id && item.selectedSize === size
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id && item.selectedSize === size
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [...state.items, { ...product, quantity: 1, selectedSize: size }],
                    };
                });
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.id === productId && item.selectedSize === size)
                    ),
                }));
            },

            updateQuantity: (productId, quantity, size) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === productId && item.selectedSize === size
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const price = item.discounted_price && item.discounted_price > 0
                        ? item.discounted_price
                        : item.price;
                    return total + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'dracarys-cart',
        }
    )
);
