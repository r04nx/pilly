import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from '@/lib/email/service';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch order + items (no FK join to profiles)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`*, order_items(*, product:products(name))`)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Order not found');
    }

    // Fetch profile separately (if user is logged in)
    let profile: any = null;
    if (order.user_id) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, company_name')
        .eq('id', order.user_id)
        .single();
      profile = data;
    }

    // Format for email service — fall back to shipping_address for guest orders
    const orderData = {
      id: order.id,
      order_number: order.order_number,
      customer_email: profile?.email || order.shipping_address?.email,
      customer_name: profile?.company_name || profile?.full_name || order.shipping_address?.full_name,
      items: order.order_items.map((item: any) => ({
        product_name: item.product?.name || 'Product',
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.quantity * item.unit_price)
      })),
      total_amount: Number(order.total_amount),
      shipping_amount: Number(order.shipping_amount || 0),
      tax_amount: Number(order.tax_amount || 0),
      created_at: order.created_at
    };

    // 1. Send Order Confirmation to Customer
    await sendOrderConfirmationEmail(orderData);

    // 2. Send Alert to Admin
    await sendAdminOrderAlert(orderData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checkout notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
