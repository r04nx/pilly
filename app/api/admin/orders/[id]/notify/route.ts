import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderStatusUpdate } from '@/lib/email/service';
import { generateInvoicePDF } from '@/lib/email/invoice';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    // Verify admin role
    const isAdmin = adminUser?.user_metadata?.role === 'admin' || adminUser?.email === 'rohan@noulez.app';
    if (!adminUser || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, customMessage, customerEmail } = await req.json();

    if (!status || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Send the branded email with optional invoice attachment
    let attachments = undefined;

    if (status === 'confirmed') {
      // Fetch full order details for invoice
      const { data: order } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email), order_items(*, product:products(name))')
        .eq('id', orderId)
        .single();

      if (order) {
        const invoiceData = {
          orderNumber: order.order_number || order.id.slice(0,8).toUpperCase(),
          date: new Date(order.created_at).toLocaleDateString(),
          customerName: order.profiles?.full_name || 'Customer',
          customerEmail: order.profiles?.email || customerEmail,
          items: order.order_items.map((item: any) => ({
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: Number(item.unit_price),
            total: Number(item.quantity * item.unit_price)
          })),
          totalAmount: Number(order.total_amount),
          shippingAmount: Number(order.shipping_amount || 0),
          taxAmount: Number(order.tax_amount || 0)
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);
        attachments = [{
          filename: `Invoice_${invoiceData.orderNumber}.pdf`,
          content: pdfBuffer
        }];
      }
    }

    await sendOrderStatusUpdate(customerEmail, orderId, status, customMessage, attachments);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
