import { create } from 'zustand';
import type { Toast } from '../types/database';

interface ToastStore {
    toasts: Toast[];
    addToast: (type: Toast['type'], message: string) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (type, message) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, type, message };

        set((state) => ({
            toasts: [...state.toasts, toast],
        }));

        // Автоматически удалить через 3 секунды
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 3000);
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
