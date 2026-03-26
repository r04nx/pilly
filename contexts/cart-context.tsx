'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price?: number; // Include price for cart calculations
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    price: number;
    active: boolean;
    featured: boolean;
    stock_quantity: number;
    image_url?: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Fetch cart from database or localStorage
  const refetchCart = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Logged in user - fetch from database
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(id, name, sku, description, price, active, featured, stock_quantity, image_url)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setItems(data || []);
      } else {
        // Guest user - fetch from localStorage
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          setItems(JSON.parse(guestCart));
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product: any, quantity: number = 1) => {
    try {
      // Try to get user, but don't fail if not authenticated
      let user = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch (authError) {
        // User is not authenticated, continue as guest
        console.log('User not authenticated, proceeding as guest');
      }
      
      if (user && user.id) {
        // Logged in user - add to database
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();

        if (existingItem) {
          // Update existing item
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);

          if (error) throw error;
        } else {
          // Add new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity
            });

          if (error) throw error;
        }
      } else {
        // Guest user - add to localStorage (no API call)
        const guestCart = localStorage.getItem('guest_cart');
        const cartItems: CartItem[] = guestCart ? JSON.parse(guestCart) : [];
        
        const existingItem = cartItems.find(item => item.product_id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cartItems.push({
            id: Date.now().toString(),
            user_id: 'guest',
            product_id: product.id,
            quantity,
            price: product.price,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              description: product.description,
              price: product.price,
              active: product.active,
              featured: product.featured,
              stock_quantity: product.stock_quantity,
              image_url: product.image_url
            }
          });
        }
        
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        setItems(cartItems);
        return; // Skip refetchCart for guest users
      }
      
      await refetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Don't throw error, just log it to avoid breaking the UI
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id) {
        // Logged in user - remove from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Guest user - remove from localStorage
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          const cartItems: CartItem[] = JSON.parse(guestCart);
          const filteredItems = cartItems.filter(item => item.product_id !== productId);
          localStorage.setItem('guest_cart', JSON.stringify(filteredItems));
          setItems(filteredItems);
        }
      }
      
      await refetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id) {
        // Logged in user - update in database
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        // Guest user - update in localStorage
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          const cartItems: CartItem[] = JSON.parse(guestCart);
          const item = cartItems.find(item => item.product_id === productId);
          if (item) {
            item.quantity = quantity;
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
            setItems(cartItems);
          }
        }
      }
      
      await refetchCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id) {
        // Logged in user - clear from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Guest user - clear from localStorage
        localStorage.removeItem('guest_cart');
        setItems([]);
      }
      
      await refetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Merge guest cart with user cart when user logs in
  useEffect(() => {
    const mergeCarts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
          const cartItems: CartItem[] = JSON.parse(guestCart);
          
          // Add each guest cart item to user cart
          for (const item of cartItems) {
            try {
              const { data: existingItem } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', item.product_id)
                .single();

              if (existingItem) {
                await supabase
                  .from('cart_items')
                  .update({ quantity: existingItem.quantity + item.quantity })
                  .eq('id', existingItem.id);
              } else {
                await supabase
                  .from('cart_items')
                  .insert({
                    user_id: user.id,
                    product_id: item.product_id,
                    quantity: item.quantity
                  });
              }
            } catch (error) {
              console.error('Error merging cart item:', error);
            }
          }
          
          // Clear guest cart
          localStorage.removeItem('guest_cart');
          await refetchCart();
        }
      }
    };

    mergeCarts();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        mergeCarts();
      } else if (event === 'SIGNED_OUT') {
        refetchCart();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Initial cart fetch
  useEffect(() => {
    refetchCart();
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
