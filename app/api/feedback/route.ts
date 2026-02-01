import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

const VALID_CHOICES = ['agree', 'disagree', 'too_much', 'fun'];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { article_id, choice } = body;

  if (!article_id || !choice) {
    return NextResponse.json(
      { error: 'article_id and choice are required' },
      { status: 400 }
    );
  }

  if (!VALID_CHOICES.includes(choice)) {
    return NextResponse.json(
      { error: `choice must be one of: ${VALID_CHOICES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert({ article_id, choice })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feedback: data }, { status: 201 });
}
