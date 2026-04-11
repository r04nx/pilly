'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, ShoppingBag, Zap, Check, X, Info, Package, ShieldCheck, Truck, ArrowRight, Share2, Heart, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: number;
    active: boolean;
    featured: boolean;
    stock_quantity: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    category_name?: string | null;
    image_url?: string | null;
    compare_at_price?: number | null;
}

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => Promise<void>;
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    // Reset quantity and added state when modal opens for a new product
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setIsAdded(false);
            setImageError(false);
        }
    }, [isOpen, product?.id]);

    if (!product) return null;

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(product.stock_quantity, prev + delta)));
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        await onAddToCart(product, quantity);
        setIsAdding(false);
        setIsAdded(true);
    };

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discount = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 gap-0">
                <div className="flex flex-col md:flex-row w-full h-full max-h-[95vh] md:h-[750px] overflow-y-auto md:overflow-hidden font-sans">
                    {/* Left: Image Side */}
                    <div className="relative w-full md:w-[45%] bg-slate-50 flex items-center justify-center p-8 md:p-12 border-r border-slate-100/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-indigo-100/30 opacity-70"></div>

                        {/* Top Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                            {product.featured && (
                                <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in slide-in-from-left duration-500">
                                    <Zap className="w-3 h-3 fill-white" />
                                    FEATURED
                                </div>
                            )}
                            {hasDiscount && (
                                <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in slide-in-from-left delay-100 duration-500">
                                    <Tag className="w-3 h-3 fill-white" />
                                    {discount}% OFF
                                </div>
                            )}
                        </div>

                        {/* Main Image */}
                        <div className="relative w-full aspect-square max-w-[340px] group flex items-center justify-center">
                            <div className="absolute inset-0 bg-sky-400/10 blur-[80px] rounded-full scale-125 opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            {product.image_url && !imageError ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-2"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white flex flex-col items-center justify-center p-12 transition-all duration-500 group-hover:bg-white/80">
                                    <ShoppingBag className="w-20 h-20 text-sky-100 mb-4 transition-transform duration-700 group-hover:scale-110" />
                                    <span className="text-slate-400 font-bold text-sm tracking-tight">Image Coming Soon</span>
                                </div>
                            )}
                        </div>

                        {/* Category Breadcrumb */}
                        {product.category_name && (
                            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 text-sky-700 font-black text-[10px] uppercase tracking-widest opacity-60">
                                <div className="h-px bg-sky-200 flex-1"></div>
                                {product.category_name}
                                <div className="h-px bg-sky-200 flex-1"></div>
                            </div>
                        )}
                    </div>

                    {/* Right: Content Side */}
                    <div className="w-full md:w-[55%] flex flex-col h-full bg-white">
                        <div className="p-8 md:p-12 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                            {/* Header Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-in fade-in duration-500">
                                    <span className="flex items-center gap-1.5 text-sky-500">
                                        <Package className="w-3.5 h-3.5" />
                                        SKU {product.sku || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-4">
                                        <button className="hover:text-blue-500 transition-colors"><Share2 className="w-4 h-4" /></button>
                                        <button className="hover:text-rose-500 transition-colors"><Heart className="w-4 h-4" /></button>
                                    </span>
                                </div>
                                <DialogHeader className="p-0 text-left space-y-0">
                                    <DialogTitle className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[0.95] animate-in slide-in-from-bottom-2 duration-500">
                                        {product.name}
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Detailed view for {product.name}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-baseline gap-4 animate-in fade-in delay-200 duration-500">
                                <div className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">
                                    ${product.price.toFixed(2)}
                                </div>
                                {hasDiscount && (
                                    <div className="flex flex-col">
                                        <span className="text-lg text-slate-300 line-through font-bold leading-tight decoration-rose-400/30 decoration-2">
                                            ${product.compare_at_price?.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                                            Save ${(product.compare_at_price! - product.price).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Details Boxes */}
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in delay-300 duration-500">
                                <div className="p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                        product.stock_quantity > 0 ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" : "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
                                    )}>
                                        {product.stock_quantity > 0 ? <Truck className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Stock</div>
                                        <div className={cn(
                                            "text-sm font-black",
                                            product.stock_quantity > 0 ? "text-slate-900" : "text-rose-600"
                                        )}>
                                            {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Sold Out'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quality</div>
                                        <div className="text-sm font-black text-slate-900 leading-tight">Certified Safe</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3 animate-in fade-in delay-400 duration-500">
                                <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">
                                    <div className="w-1 h-4 bg-sky-500 rounded-full"></div>
                                    Overview
                                </div>
                                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                                    {product.description || 'No detailed description available. This medication meets all standard quality certifications for safety and efficacy.'}
                                </p>
                            </div>
                        </div>

                        {/* Footer: Fixed Actions */}
                        <div className="p-8 md:p-12 border-t border-slate-100 bg-white/50 backdrop-blur-md sticky bottom-0">
                            {product.stock_quantity > 0 ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center bg-slate-100/80 rounded-2xl p-1.5 border border-slate-200/50 shadow-inner group transition-all hover:bg-white hover:shadow-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1 || isAdding}
                                            className="h-11 w-11 rounded-xl hover:bg-slate-100 transition-all text-slate-500 disabled:opacity-20"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-10 text-center font-black text-xl text-slate-900 tabular-nums">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock_quantity || isAdding}
                                            className="h-11 w-11 rounded-xl hover:bg-slate-100 transition-all text-slate-500"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={isAdded ? () => router.push('/customer/cart') : handleAddToCart}
                                        disabled={isAdding}
                                        className={cn(
                                            "flex-1 h-16 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] group",
                                            isAdding
                                                ? "bg-green-500 hover:bg-green-600 text-white"
                                                : isAdded
                                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                                                    : "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white"
                                        )}
                                    >
                                        {isAdding ? (
                                            <>
                                                <Check className="w-5 h-5 mr-2 animate-in zoom-in duration-300" />
                                                Adding...
                                            </>
                                        ) : isAdded ? (
                                            <div className="flex items-center justify-center w-full gap-3">
                                                <Check className="w-6 h-6" />
                                                View in Cart
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full px-4">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    Add to Cart
                                                </div>
                                                <div className="flex items-center gap-2 opacity-80">
                                                    <span className="h-4 w-px bg-white/30 hidden sm:block"></span>
                                                    <span className="text-sm font-bold">${(product.price * quantity).toFixed(2)}</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full h-14 rounded-2xl bg-rose-50 border-2 border-rose-100 flex items-center justify-center gap-2 text-rose-600 font-black uppercase tracking-widest text-sm shadow-inner">
                                    <Info className="w-4 h-4" />
                                    Currently Out of Stock
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
