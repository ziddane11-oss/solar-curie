import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await supabase
    .from('analyses')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analysis: data });
}
