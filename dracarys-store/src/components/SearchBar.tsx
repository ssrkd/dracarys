import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Поиск товаров...',
}) => {
    const [query, setQuery] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${query ? 'text-dark' : 'text-gray/50'}`}>
                <Search className="w-5 h-5" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-14 pr-12 py-4 bg-light/50 border-2 border-transparent rounded-apple-lg text-lg text-dark placeholder-gray/40 focus:outline-none focus:bg-white focus:border-dark/5 focus:shadow-apple-lg transition-all duration-500"
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-all animate-scale-in tap-highlight-none"
                >
                    <X className="w-4 h-4 text-gray" />
                </button>
            )}
        </div>
    );
};
