-- News Insights MVP - Initial Migration

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP,
  summary_fact TEXT,
  content_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft',
  analysis_version VARCHAR(10) DEFAULT 'v1',
  tone_level INT DEFAULT 2,
  analysis_text TEXT NOT NULL,
  risk_flags JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  source_utm VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  choice VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_content_hash ON articles(content_hash);
CREATE INDEX idx_analyses_article_id ON analyses(article_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_feedback_article_id ON feedback(article_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
