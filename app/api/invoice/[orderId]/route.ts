import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/lib/email/invoice';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const supabase = await createClient();
  const { orderId } = await params;

  try {
    // 1. Fetch Order and Items (order_items has FK, so join works)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Invoice Order Query Error:', orderError);
      return new NextResponse('Order not found', { status: 404 });
    }

    // 2. Fetch Profile separately since no direct FK exists in Public schema for join
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, company_name, address, city')
      .eq('id', order.user_id)
      .single();

    if (profileError) {
      console.warn('Profile not found for invoice, continuing with order data:', profileError);
    }

    const formatAddress = (addr: any) => {
      if (!addr) return '';
      if (typeof addr === 'string') return addr;
      const parts = [
        addr.full_name || addr.fullName,
        addr.address,
        [addr.city, addr.state].filter(Boolean).join(', '),
        addr.zip_code || addr.postal_code || addr.postalCode,
        addr.country,
      ].filter(Boolean);
      return parts.join('\n');
    };

    // 3. Prepare Invoice Data
    const invoiceData = {
      orderNumber: order.order_number || order.id.slice(0, 8).toUpperCase(),
      date: new Date(order.created_at).toLocaleDateString(),
      customerName: profile?.company_name || profile?.full_name || order.shipping_address?.full_name || 'Valued Customer',
      customerEmail: profile?.email || order.shipping_address?.email || 'N/A',
      customerPhone: order.shipping_address?.phone || '',
      billingAddress: formatAddress(order.billing_address || order.shipping_address),
      shippingAddress: formatAddress(order.shipping_address),
      paymentMethod: order.payment_method || '',
      items: order.order_items.map((item: any) => ({
        name: item.products?.name || 'Product',
        sku: item.products?.sku || undefined,
        quantity: item.quantity,
        price: Number(item.unit_price),
        total: Number(item.quantity * item.unit_price)
      })),
      totalAmount: Number(order.total_amount),
      shippingAmount: Number(order.shipping_amount || 0),
      taxAmount: Number(order.tax_amount || 0)
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Invoice_${invoiceData.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice PDF Generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
