import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { checkForbiddenPatterns } from '@/lib/analysis';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { analysis_text, tone_level } = body;

  if (!analysis_text) {
    return NextResponse.json(
      { error: 'analysis_text is required' },
      { status: 400 }
    );
  }

  const riskFlags = checkForbiddenPatterns(analysis_text);

  const updateData: Record<string, unknown> = {
    analysis_text,
    risk_flags: riskFlags,
  };

  if (tone_level !== undefined) {
    updateData.tone_level = tone_level;
  }

  const { data, error } = await supabase
    .from('analyses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analysis: data });
}
