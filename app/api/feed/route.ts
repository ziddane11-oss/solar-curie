import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase
    .from('articles')
    .select(`
      *,
      analyses!inner(*)
    `)
    .eq('analyses.status', 'published')
    .order('published_at', { ascending: false });

  if (date) {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    query = query
      .gte('published_at', startOfDay)
      .lte('published_at', endOfDay);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data });
}
