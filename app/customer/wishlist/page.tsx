'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Trash2, ArrowRight, Package, Home, Info } from 'lucide-react';
import { Pilly } from '@/components/pilly';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
    brand: string;
    stock_quantity: number;
    product_images: {
      image_url: string;
    }[];
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            in_stock,
            brand,
            stock_quantity,
            product_images (url)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50/30">
        <div className="text-center">
          <Pilly expression="thinking" size={120} className="mb-4" />
          <p className="text-sky-600 font-medium animate-pulse">Checking your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Heart className="w-10 h-10 text-red-500 fill-current" />
              Your Wishlist
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Items you've saved for later</p>
          </div>
          <Link href="/customer/dashboard">
            <Button variant="outline" className="rounded-full">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed border-2 bg-sky-50/20 py-20">
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-sky-300" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your wishlist is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto mt-4 text-lg">
                Save items you love and they'll show up here. Ready to find something amazing?
              </p>
              <Link href="/customer/products" className="mt-8">
                <Button size="lg" className="rounded-full px-8 bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-200">
                  Browse Products <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              if (!product) return null;

              return (
              <Card key={item.id} className="group overflow-hidden border-sky-100/50 hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white/70 backdrop-blur-md">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.product_images?.[0]?.url || product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <Badge variant="destructive" className="px-4 py-2 text-sm font-bold shadow-lg uppercase tracking-widest">Out of Stock</Badge>
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">{product.brand}</span>
                    <span className="text-xl font-black text-foreground">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-1 group-hover:text-sky-600 transition-colors">{product.name}</h3>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      className="flex-1 rounded-2xl bg-sky-600 hover:bg-sky-700 h-12 shadow-lg shadow-sky-100 font-bold"
                      disabled={!product.in_stock}
                      onClick={async () => {
                        await addToCart(product, 1);
                        toast.success('Added to cart');
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Link href={`/customer/products?id=${item.product_id}`} className="block">
                      <Button variant="outline" className="rounded-2xl h-12 border-sky-100 hover:bg-sky-50 text-sky-600 px-4">
                        <Info className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
