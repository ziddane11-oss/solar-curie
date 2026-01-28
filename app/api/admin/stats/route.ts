import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [
    articlesTotal,
    articlesToday,
    analysesDraft,
    analysesPublished,
    analysesToday,
    subscriptionsTotal,
    feedbackTotal,
    feedbackTooMuch,
    recentErrors,
    lastIngest,
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStr),
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStr),
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true }),
    supabase.from('feedback').select('id', { count: 'exact', head: true }),
    supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .eq('choice', 'too_much'),
    supabase
      .from('events')
      .select('id, event_type, meta, created_at')
      .like('event_type', 'error:%')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('ingest_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const tooMuchRate =
    (feedbackTotal.count ?? 0) > 0
      ? ((feedbackTooMuch.count ?? 0) / (feedbackTotal.count ?? 1)) * 100
      : 0;

  return NextResponse.json({
    articles: {
      total: articlesTotal.count ?? 0,
      today: articlesToday.count ?? 0,
    },
    analyses: {
      draft: analysesDraft.count ?? 0,
      published: analysesPublished.count ?? 0,
      today: analysesToday.count ?? 0,
    },
    subscriptions: {
      total: subscriptionsTotal.count ?? 0,
    },
    feedback: {
      total: feedbackTotal.count ?? 0,
      too_much_count: feedbackTooMuch.count ?? 0,
      too_much_rate: Math.round(tooMuchRate * 10) / 10,
    },
    recent_errors: recentErrors.data ?? [],
    last_ingest: lastIngest.data,
  });
}
