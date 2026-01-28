import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, source_utm } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Valid email is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({ email, source_utm: source_utm || null }, { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data }, { status: 201 });
}
