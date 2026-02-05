import React from 'react';
import { formatPrice } from '../../utils/formatters';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: 'success' | 'danger' | 'accent' | 'dark';
    isPrice?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    label, value, icon, trend, color = 'dark', isPrice
}) => {
    const colorStyles = {
        success: 'bg-success/5 text-success',
        danger: 'bg-danger/5 text-danger',
        accent: 'bg-accent/5 text-accent',
        dark: 'bg-dark/5 text-dark'
    };

    return (
        <div className="group glass p-6 rounded-apple-xl border-white/50 shadow-apple-sm transition-all hover:shadow-apple active:scale-[0.98]">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${colorStyles[color]} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-gray/10 text-gray'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray opacity-60">{label}</span>
                <p className="text-2xl font-bold text-dark tracking-tighter">
                    {isPrice ? `${formatPrice(Number(value))} ₸` : value}
                </p>
            </div>
        </div>
    );
};
