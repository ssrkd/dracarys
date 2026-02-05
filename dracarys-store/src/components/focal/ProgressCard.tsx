import React from 'react';

interface ProgressCardProps {
    label: string;
    current: number;
    target: number;
    unit?: string;
    color?: string;
    description?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    label, current, target, unit = '', color = 'var(--accent)', description
}) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100);

    return (
        <div className="glass p-6 rounded-apple-2xl border-white/50 shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-dark tracking-tight">{label}</h3>
                    {description && <p className="text-[10px] text-gray uppercase tracking-widest font-black mt-1">{description}</p>}
                </div>
                <span className="text-xl font-bold text-dark">{percentage}%</span>
            </div>

            <div className="h-2 w-full bg-light rounded-full overflow-hidden mb-3">
                <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}40`
                    }}
                />
            </div>

            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray">
                <span>{current} {unit}</span>
                <span>Цель: {target} {unit}</span>
            </div>
        </div>
    );
};
