import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark/30 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full ${sizeStyles[size]} bg-white rounded-apple-lg shadow-strong overflow-hidden animate-scale-in`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-light">
                    <h2 className="text-xl font-bold text-dark">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light rounded-apple transition-colors tap-highlight-none"
                    >
                        <X className="w-5 h-5 text-gray" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
            </div>
        </div>
    );
};
