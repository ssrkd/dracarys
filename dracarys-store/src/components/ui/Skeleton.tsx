import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
}) => {
    const variantStyles = {
        rectangular: 'rounded-apple',
        circular: 'rounded-full',
        text: 'rounded-sm h-4 w-full',
    };

    return (
        <div
            className={`skeleton ${variantStyles[variant]} ${className}`}
        />
    );
};
