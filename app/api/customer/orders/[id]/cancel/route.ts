import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderStatusUpdate } from '@/lib/email/service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch order to verify ownership and eligible status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, profiles(email)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return NextResponse.json({ 
        error: `Order cannot be cancelled in its current state (${order.status})` 
      }, { status: 400 });
    }

    // 2. Update status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 3. Notify Customer and ALL Admins
    const customerEmail = order.profiles?.email || user.email;
    if (customerEmail) {
      await sendOrderStatusUpdate(
        customerEmail,
        orderId,
        'cancelled',
        'Canceled at student/customer request.'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
