import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { fetchAllFeeds } from '@/lib/rss';
import { log } from '@/lib/logger';

const INGEST_COOLDOWN_MINUTES = 10;

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  // 중복 실행 방지: 최근 N분 이내에 실행된 수집이 있는지 확인
  const cutoff = new Date(
    Date.now() - INGEST_COOLDOWN_MINUTES * 60 * 1000
  ).toISOString();

  const { data: recentRun } = await supabase
    .from('ingest_log')
    .select('id, started_at, status')
    .gte('started_at', cutoff)
    .in('status', ['running', 'completed'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentRun) {
    const msg =
      recentRun.status === 'running'
        ? '수집이 이미 실행 중입니다.'
        : `최근 ${INGEST_COOLDOWN_MINUTES}분 이내에 수집이 완료되었습니다.`;
    return NextResponse.json(
      { error: msg, last_run: recentRun.started_at },
      { status: 429 }
    );
  }

  // 수집 시작 기록
  const { data: logEntry } = await supabase
    .from('ingest_log')
    .insert({ status: 'running' })
    .select()
    .single();

  try {
    const items = await fetchAllFeeds();

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of items) {
      if (!item.url) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from('articles').upsert(
        {
          source: item.source,
          title: item.title,
          url: item.url,
          published_at: item.published_at,
          summary_fact: item.summary_fact,
          content_hash: item.content_hash,
        },
        { onConflict: 'url' }
      );

      if (error) {
        errors.push(`${item.title}: ${error.message}`);
        skipped++;
      } else {
        inserted++;
      }
    }

    const result = {
      total: items.length,
      inserted,
      skipped,
      errors: errors.slice(0, 5),
    };

    // 수집 완료 기록
    if (logEntry) {
      await supabase
        .from('ingest_log')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          result,
        })
        .eq('id', logEntry.id);
    }

    await log('rss_ingest', 'info', result);

    return NextResponse.json(result);
  } catch (err) {
    // 수집 실패 기록
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    if (logEntry) {
      await supabase
        .from('ingest_log')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          result: { error: errorMsg },
        })
        .eq('id', logEntry.id);
    }

    await log('rss_ingest', 'error', { error: errorMsg });

    return NextResponse.json(
      { error: 'Ingest failed', detail: errorMsg },
      { status: 500 }
    );
  }
}
