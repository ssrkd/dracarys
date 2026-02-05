import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full group">
            {label && (
                <label className="block text-sm font-medium text-gray mb-1.5 transition-colors group-focus-within:text-dark">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-2.5 bg-light border-2 ${error ? 'border-error' : 'border-transparent'
                    } rounded-apple text-dark placeholder-gray/60 focus:outline-none focus:bg-white focus:border-dark/10 focus:shadow-apple transition-all duration-300 ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs font-medium text-error animate-fade-in">{error}</p>
            )}
        </div>
    );
};
