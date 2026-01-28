import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { fetchAllFeeds } from '@/lib/rss';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

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

  // Log the ingest event
  await supabase.from('events').insert({
    event_type: 'rss_ingest',
    meta: { total: items.length, inserted, skipped, errors: errors.slice(0, 5) },
  });

  return NextResponse.json({
    total: items.length,
    inserted,
    skipped,
    errors: errors.slice(0, 5),
  });
}
