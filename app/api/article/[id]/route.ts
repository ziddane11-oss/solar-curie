import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('article_id', id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const { data: feedbackCounts } = await supabase
    .rpc('get_feedback_counts', { p_article_id: id });

  return NextResponse.json({
    article,
    analyses: analyses || [],
    feedbackCounts: feedbackCounts || [],
  });
}
