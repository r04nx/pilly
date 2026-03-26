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
    
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email, company_name), order_items(*, product:products(name))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Order not found');
    }

    // Format for email service
    const orderData = {
      id: order.id,
      order_number: order.order_number,
      customer_email: order.profiles?.email || order.shipping_address?.email,
      customer_name: order.profiles?.company_name || order.profiles?.full_name || order.shipping_address?.fullName,
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
