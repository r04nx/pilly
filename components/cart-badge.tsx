'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShoppingCart } from 'lucide-react';

export function CartBadge() {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCartCount(0);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('user_id', user.id);

        if (error) throw error;

        const totalItems = (data || []).reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error('Cart count fetch error:', error);
        setCartCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCartCount();

    // Listen for cart changes
    const channel = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
        },
        () => {
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ShoppingCart className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <Link href="/customer/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}
