import React from 'react';
import { Sparkles, Brain, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface InsightCardProps {
    type: 'strategy' | 'pattern' | 'risk' | 'summary';
    content: string;
    title: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ type, content, title }) => {
    const icons = {
        strategy: <Zap className="w-4 h-4 text-accent" />,
        pattern: <TrendingUp className="w-4 h-4 text-success" />,
        risk: <AlertTriangle className="w-4 h-4 text-danger" />,
        summary: <Brain className="w-4 h-4 text-dark" />
    };

    const colors = {
        strategy: 'border-accent/20 bg-accent/5',
        pattern: 'border-success/20 bg-success/5',
        risk: 'border-danger/20 bg-danger/5',
        summary: 'border-dark/10 bg-dark/5'
    };

    return (
        <div className={`p-5 rounded-apple-2xl border-2 ${colors[type]} transition-all hover:scale-[1.01]`}>
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-soft">
                    {icons[type]}
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-dark/60">{title}</h4>
            </div>
            <p className="text-sm font-medium text-dark leading-relaxed italic">
                "{content}"
            </p>
            <div className="mt-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-gray opacity-40">AI-Generated Context</span>
            </div>
        </div>
    );
};
