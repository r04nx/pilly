import { createClient } from '@/lib/supabase/client';

class ApiClient {
  private supabase = createClient();

  // Auth
  async signUpWithEmail(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          data: {
            full_name: fullName,
            is_admin: false,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to resend verification email' };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Google sign in failed' };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Password reset request failed' };
    }
  }

  async updatePassword(password: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({ password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Password update failed' };
    }
  }

  // Products
  async getProducts(categoryId?: string, limit = 50) {
    try {
      let query = this.supabase.from('products').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch products' };
    }
  }

  async getProductById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch product' };
    }
  }

  // Categories
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch categories' };
    }
  }

  // Orders
  async createOrder(items: Array<{ product_id: string; quantity: number }>, notes?: string) {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      if (!authData.user) throw new Error('User not authenticated');

      // Calculate total
      let total = 0;
      for (const item of items) {
        const { data: product } = await this.getProductById(item.product_id);
        if (product) total += product.price * item.quantity;
      }

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert({
          user_id: authData.user.id,
          status: 'pending',
          total_amount: total,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: 0, // Will be updated by trigger or in a separate update
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create order' };
    }
  }

  async getOrders() {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch orders' };
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update order' };
    }
  }

  // Support Tickets
  async createSupportTicket(subject: string, description: string, priority = 'medium') {
    try {
      const { data: authData } = await this.supabase.auth.getUser();
      if (!authData.user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('support_tickets')
        .insert({
          user_id: authData.user.id,
          subject,
          description,
          priority,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create support ticket' };
    }
  }

  async getSupportTickets() {
    try {
      const { data, error } = await this.supabase
        .from('support_tickets')
        .select('*');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch support tickets' };
    }
  }
}

export const apiClient = new ApiClient();
