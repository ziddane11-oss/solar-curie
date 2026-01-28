-- News Insights MVP - Initial Migration
-- 타임존: 모든 TIMESTAMP는 TIMESTAMPTZ (UTC 기준)

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMPTZ,
  summary_fact TEXT,
  content_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft',
  analysis_version VARCHAR(10) DEFAULT 'v1',
  tone_level INT DEFAULT 1,
  analysis_text TEXT NOT NULL,
  risk_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  source_utm VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  choice VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 마지막 수집 시간 추적 (중복 실행 방지)
CREATE TABLE ingest_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'running',
  result JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_content_hash ON articles(content_hash);
CREATE INDEX idx_analyses_article_id ON analyses(article_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_feedback_article_id ON feedback(article_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_ingest_log_started_at ON ingest_log(started_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- 기본 차단 후 필요한 것만 열기
-- ============================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_log ENABLE ROW LEVEL SECURITY;

-- articles: 누구나 published된 기사 읽기 가능, 쓰기는 service_role만
CREATE POLICY "Public read articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Service insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service update articles" ON articles
  FOR UPDATE USING (auth.role() = 'service_role');

-- analyses: published된 해설만 public 읽기, 나머지는 service_role만
CREATE POLICY "Public read published analyses" ON analyses
  FOR SELECT USING (status = 'published' OR auth.role() = 'service_role');

CREATE POLICY "Service insert analyses" ON analyses
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service update analyses" ON analyses
  FOR UPDATE USING (auth.role() = 'service_role');

-- subscriptions: service_role만 읽기/쓰기
CREATE POLICY "Service manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- feedback: 누구나 쓰기 가능, 읽기는 service_role만
CREATE POLICY "Public insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service read feedback" ON feedback
  FOR SELECT USING (auth.role() = 'service_role');

-- events: 누구나 쓰기 가능, 읽기는 service_role만
CREATE POLICY "Public insert events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service read events" ON events
  FOR SELECT USING (auth.role() = 'service_role');

-- ingest_log: service_role만
CREATE POLICY "Service manage ingest_log" ON ingest_log
  FOR ALL USING (auth.role() = 'service_role');
