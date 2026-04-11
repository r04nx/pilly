'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, Package, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    image_url: string | null;
    category_name?: string | null;
}

export function GlobalSearch({ className }: { className?: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const router = useRouter();
    const supabase = createClient();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch();
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, price, image_url, category_id')
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .eq('active', true)
                .limit(6);

            if (error) throw error;
            setResults(data || []);
            setIsOpen((data || []).length > 0);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (product: Product) => {
        setQuery('');
        setIsOpen(false);
        // Deep link to products page with the product ID to open modal
        router.push(`/customer/products?productId=${product.id}`);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && results[activeIndex]) {
                handleSelect(results[activeIndex]);
            } else if (query) {
                router.push(`/customer/products?search=${encodeURIComponent(query)}`);
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={cn("relative w-full max-w-md", className)} ref={containerRef}>
            <div className="relative group">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                    isOpen ? "text-primary" : "text-muted-foreground"
                )} />
                <Input
                    type="text"
                    placeholder="Search items, SKU..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
                    onKeyDown={onKeyDown}
                    className="h-10 pl-10 pr-10 rounded-full bg-muted/40 border-border/50 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/60 w-full"
                />
                {isLoading ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                ) : query ? (
                    <button
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground/60 hover:text-foreground"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                ) : null}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 max-h-[400px] overflow-y-auto">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-800 mb-2">
                            Suggestions
                        </div>
                        <div className="space-y-1">
                            {results.map((product, index) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={cn(
                                        "flex flex-row items-center gap-4 w-full p-3 rounded-xl transition-all text-left group",
                                        activeIndex === index ? "bg-primary/5 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                                            {product.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <span>SKU: {product.sku}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-black text-sm text-blue-600">
                                            ${product.price.toFixed(2)}
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] text-primary font-black uppercase group-hover:translate-x-1 transition-transform">
                                            View <ArrowRight className="w-2.5 h-2.5" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/customer/products?search=${encodeURIComponent(query)}`)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 text-xs font-black text-slate-500 hover:text-primary flex items-center justify-center gap-2 transition-all"
                    >
                        See all results for "{query}"
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
