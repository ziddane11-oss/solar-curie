import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateAnalysis } from '@/lib/analysis';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { article_id } = body;

  if (!article_id) {
    return NextResponse.json(
      { error: 'article_id is required' },
      { status: 400 }
    );
  }

  // Fetch the article
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', article_id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Generate analysis (tone_level=1: conservative default)
  const { text, riskFlags } = await generateAnalysis(
    article.title,
    article.summary_fact,
    1
  );

  // Save as draft
  const { data: analysis, error: insertError } = await supabase
    .from('analyses')
    .insert({
      article_id,
      status: 'draft',
      analysis_text: text,
      tone_level: 1,
      risk_flags: riskFlags,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ analysis });
}
