import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  _supabase = createClient(supabaseUrl, supabaseKey);
  return _supabase;
}

// Lazy-initialized proxy so the module can be imported at build time
// without requiring env vars to be present
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

// Type definitions matching our DB schema
export interface Article {
  id: string;
  source: string;
  title: string;
  url: string;
  published_at: string | null;
  summary_fact: string | null;
  content_hash: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  article_id: string;
  status: 'draft' | 'published';
  analysis_version: string;
  tone_level: number;
  analysis_text: string;
  risk_flags: Record<string, boolean>;
  created_at: string;
  published_at: string | null;
}

export interface Subscription {
  id: string;
  email: string;
  source_utm: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  article_id: string;
  choice: 'agree' | 'disagree' | 'too_much' | 'fun';
  created_at: string;
}

export interface Event {
  id: string;
  event_type: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface ArticleWithAnalysis extends Article {
  analyses: Analysis[];
}
