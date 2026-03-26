'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Pilly } from '@/components/pilly';
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  Trash2,
  Package,
  Search,
  Filter
} from 'lucide-react';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    product_images: {
      image_url: string;
    }[];
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock_quantity,
            product_images (image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        // Add to cart
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });
      }

      // Remove from wishlist
      const wishlistItem = wishlistItems.find(item => item.product_id === productId);
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      }

      alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Pilly expression="running" size={120} className="mb-4" />
          <p className="mt-4 text-muted-foreground animate-pulse font-medium tracking-wide">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length === 0 
              ? 'Your wishlist is empty' 
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty wishlist
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love to buy later!</p>
            <Link href="/products">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square bg-muted relative">
                    {item.products.product_images?.[0]?.image_url ? (
                      <img
                        src={item.products.product_images[0].image_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Package className="w-12 h-12 text-primary" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={removing === item.id}
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  {/* Product Info */}
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {item.products.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-foreground">
                      ${item.products.price.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      item.products.stock_quantity > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {item.products.stock_quantity > 0 
                        ? `${item.products.stock_quantity} in stock` 
                        : 'Out of stock'
                      }
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCart(item.products.id)}
                      disabled={item.products.stock_quantity <= 0}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link href={`/products?product=${item.products.id}`}>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="text-xs text-muted-foreground mt-3">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
