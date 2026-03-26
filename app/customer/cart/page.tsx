'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = () => {
    router.push('/customer/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-[#fcfdff] pt-24 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/customer/products"
              className="inline-flex items-center text-sky-600 hover:text-sky-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          </div>

          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <Link href="/customer/products">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff] pt-16 pb-20 px-2 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 lg:mb-8">
          <Link 
            href="/customer/products"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 mb-2 text-xs lg:text-sm"
          >
            <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Back to Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900">Cart</h1>
            <span className="text-[11px] lg:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2 lg:space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-slate-100 shadow-sm">
                <CardContent className="p-2 lg:p-6">
                  <div className="flex gap-3 lg:gap-4">
                    {/* Compact Image */}
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-slate-50">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-[13px] lg:text-lg text-slate-900 truncate pr-2">
                            {item.product?.name || 'Product'} {!item.product?.active && <span className="text-red-500 text-[10px]">(Unavailable)</span>}
                          </h3>
                          <button 
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                          </button>
                        </div>
                        <p className="text-sky-600 font-bold text-[12px] lg:text-base mt-0.5">
                          ${(item.product?.price || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Compact Quantity Controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-7 lg:h-9">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-[12px] lg:text-sm font-bold min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-slate-50 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Subtotal</p>
                          <p className="text-[13px] lg:text-base font-bold text-slate-900 leading-none">
                            ${((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-slate-100 shadow-sm">
              <CardHeader className="p-4 lg:p-6 border-b border-slate-50">
                <CardTitle className="text-base lg:text-xl font-bold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 space-y-3 lg:space-y-4 text-[13px] lg:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-slate-900">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] lg:text-xs">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-slate-900">${(total * 0.1).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-base lg:text-lg text-slate-900">
                    <span>Total</span>
                    <span className="text-sky-600">${(total * 1.1).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="hidden lg:block space-y-2 pt-4">
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-100 text-sm font-bold h-11"
                    disabled={isLoading}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={clearCart}
                    className="w-full text-slate-500 hover:text-red-500 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Checkout */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 px-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Amount</p>
          <p className="text-lg font-bold text-sky-600 leading-none">
            ${(total * 1.1).toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={handleCheckout}
          className="bg-sky-600 hover:bg-sky-700 px-8 font-bold h-11"
          disabled={isLoading}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
