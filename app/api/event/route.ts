import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_type, meta } = body;

  if (!event_type) {
    return NextResponse.json(
      { error: 'event_type is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('events')
    .insert({ event_type, meta: meta || {} })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
