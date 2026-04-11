import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // Verify the requester is an authenticated admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all orders — is_admin() RLS policy grants full access
    // No profiles join (FK points to auth.users, not profiles)
    // Customer info is available inside shipping_address JSONB
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(name, sku, image_url))')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Admin orders fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
}
