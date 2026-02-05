import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../../types/database';

interface ToastProps {
    toast: ToastType;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const icons = {
        success: <CheckCircle className="w-6 h-6 text-success" />,
        error: <XCircle className="w-6 h-6 text-error" />,
        info: <Info className="w-6 h-6 text-dark" />,
    };

    return (
        <div className="flex items-center gap-4 p-4 min-w-[320px] max-w-md glass rounded-apple-lg shadow-apple-lg animate-slide-down pointer-events-auto border-white/40">
            <div className="shrink-0">{icons[toast.type]}</div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-dark">{toast.message}</p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X className="w-4 h-4 text-gray" />
            </button>
        </div>
    );
};
