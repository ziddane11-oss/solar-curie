import { supabase } from '@/lib/db';

type LogLevel = 'info' | 'warn' | 'error';

export async function log(
  eventType: string,
  level: LogLevel,
  data: Record<string, unknown>
): Promise<void> {
  const meta = { level, ...data, timestamp: new Date().toISOString() };

  // console output (always, for Vercel logs)
  const prefix = `[${level.toUpperCase()}] ${eventType}`;
  if (level === 'error') {
    console.error(prefix, JSON.stringify(meta));
  } else if (level === 'warn') {
    console.warn(prefix, JSON.stringify(meta));
  } else {
    console.log(prefix, JSON.stringify(meta));
  }

  // DB에 기록 (실패해도 throw하지 않음)
  try {
    await supabase.from('events').insert({
      event_type: `${level}:${eventType}`,
      meta,
    });
  } catch {
    console.error(`Failed to write log to DB: ${eventType}`);
  }
}
