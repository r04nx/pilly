'use client';

import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';

export default function CartIcon() {
  const { items, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const total = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div className="relative" ref={dropdownRef} data-testid="cart-icon-container">
      {/* Amazon-style Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="cart-icon"
        className="relative flex items-center gap-1 sm:gap-2 bg-white border border-slate-300 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
      >
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">Cart</span>
        
        {/* Amazon-style Cart Count Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-md" data-testid="cart-count">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Amazon-style Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 sm:mt-2 w-72 sm:w-96 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl z-50 max-h-96 overflow-hidden" data-testid="cart-dropdown">
          {/* Dropdown Header */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm sm:text-base text-slate-800">Shopping Cart</h3>
              <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-xs">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="text-slate-400 text-sm">Your cart is empty</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors" data-testid="cart-item">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product?.image_url && item.product.image_url.trim() !== '' ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center">
                            <span className="text-xs text-slate-400">No img</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-slate-800 line-clamp-2 mb-1">
                          {item.product?.name || 'Product'}
                        </h4>
                        
                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs sm:text-sm font-semibold text-slate-700">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </div>
                          
                          {/* Mobile-Optimized Quantity Controls */}
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                              className="h-5 w-5 p-0 hover:bg-slate-200 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs sm:text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="h-5 w-5 p-0 hover:bg-slate-200 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product_id)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          {items.length > 0 && (
            <div className="bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Subtotal:</span>
                <span className="text-base sm:text-lg font-bold text-slate-900">{formatPrice(total)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCart()}
                  className="flex-1 h-8 sm:h-10 text-xs sm:text-sm border-slate-300 hover:bg-slate-100"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                
                <Link href="/cart" onClick={() => setIsOpen(false)} data-testid="view-cart-link">
                  <Button data-testid="view-cart-button" className="flex-1 h-8 sm:h-10 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
