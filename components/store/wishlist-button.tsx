'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  initialIsWishlisted?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
  size?: 'sm' | 'icon' | 'default';
}

export default function WishlistButton({
  productId,
  initialIsWishlisted = false,
  className,
  variant = 'outline',
  size = 'icon'
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (data) setIsWishlisted(true);
    };

    if (!initialIsWishlisted) {
      checkWishlist();
    }
  }, [productId, initialIsWishlisted, supabase]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please login to add items to your wishlist', {
          action: {
            label: 'Login',
            onClick: () => window.location.href = '/auth/login'
          }
        });
        return;
      }

      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({
            product_id: productId,
            user_id: user.id
          });

        if (error) throw error;
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full transition-all duration-300",
        isWishlisted 
          ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600" 
          : "hover:bg-red-50 hover:text-red-500 hover:border-red-200",
        className
      )}
      onClick={toggleWishlist}
      disabled={loading}
    >
      <Heart 
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          loading && "animate-spin-slow",
          isWishlisted && "fill-current scale-110"
        )} 
      />
    </Button>
  );
}
