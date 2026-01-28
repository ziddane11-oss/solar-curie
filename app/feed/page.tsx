'use client';

import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  source: string;
  published_at: string | null;
  summary_fact: string | null;
}

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const res = await fetch('/api/feed');
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    // Track landing view
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'feed_view' }),
    });

    loadFeed();
  }, []);

  const filteredArticles =
    filter === 'all'
      ? articles
      : articles.filter((a) => {
          if (filter === 'economy') {
            return ['Reuters', 'Bloomberg', 'WSJ', 'Financial Times'].includes(
              a.source
            );
          }
          if (filter === 'tech') {
            return a.source === 'TechCrunch';
          }
          return true;
        });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">오늘의 인사이트</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: '전체' },
          { value: 'economy', label: '경제' },
          { value: 'tech', label: '테크' },
        ].map(({ value, label }) => (
          <Button
            key={value}
            variant={filter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          아직 발행된 기사가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              source={article.source}
              published_at={article.published_at}
              summary_fact={article.summary_fact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
