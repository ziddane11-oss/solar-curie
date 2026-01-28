'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackButtons } from '@/components/FeedbackButtons';
import { SubscribeForm } from '@/components/SubscribeForm';

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string | null;
  summary_fact: string | null;
}

interface Analysis {
  id: string;
  analysis_text: string;
  tone_level: number;
  published_at: string | null;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/article/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data.article);
          setAnalyses(data.analyses || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        기사를 찾을 수 없습니다.
      </div>
    );
  }

  const analysis = analyses[0];
  const sections = analysis ? parseAnalysisSections(analysis.analysis_text) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{article.source}</Badge>
          {article.published_at && (
            <span className="text-sm text-muted-foreground">
              {new Date(article.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {article.title}
        </h1>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          원문 보기 →
        </a>
      </div>

      {sections ? (
        <div className="space-y-6">
          {/* FACT Section */}
          {sections.fact && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h2 className="font-bold text-lg mb-3">[FACT]</h2>
                <div className="text-sm whitespace-pre-wrap">
                  {sections.fact}
                </div>
              </CardContent>
            </Card>
          )}

          {/* WHAT MOVES */}
          {sections.whatMoves && (
            <div>
              <h2 className="font-bold text-lg mb-3">[WHAT MOVES]</h2>
              <div className="text-sm whitespace-pre-wrap">
                {sections.whatMoves}
              </div>
            </div>
          )}

          {/* WHO WINS / WHO LOSES */}
          {sections.whoWins && (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h2 className="font-bold text-lg mb-3">
                  [WHO WINS / WHO LOSES]
                </h2>
                <div className="text-sm whitespace-pre-wrap">
                  {sections.whoWins}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SCENARIOS */}
          {sections.scenarios && (
            <div>
              <h2 className="font-bold text-lg mb-3">[SCENARIOS]</h2>
              <div className="text-sm whitespace-pre-wrap">
                {sections.scenarios}
              </div>
            </div>
          )}

          {/* CHECKPOINTS */}
          {sections.checkpoints && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold text-lg mb-3">[CHECKPOINTS]</h2>
                <div className="text-sm whitespace-pre-wrap">
                  {sections.checkpoints}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DISCLAIMER */}
          {sections.disclaimer && (
            <p className="text-xs text-muted-foreground italic border-t pt-4">
              {sections.disclaimer}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          아직 해설이 없습니다.
        </div>
      )}

      {/* Feedback */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="font-semibold mb-3">이 해설은 어떠셨나요?</h3>
        <FeedbackButtons articleId={article.id} />
      </div>

      {/* CTA */}
      <div className="mt-8 pt-6 border-t space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a
              href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              유튜브에서 더 깊게 보기
            </a>
          </Button>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            매일 이런 인사이트를 이메일로 받아보세요
          </p>
          <SubscribeForm sourceUtm="article_detail" />
        </div>
      </div>
    </div>
  );
}

function parseAnalysisSections(text: string) {
  const sections: Record<string, string> = {};

  const sectionMap: Record<string, string> = {
    FACT: 'fact',
    'WHAT MOVES': 'whatMoves',
    'WHO WINS / WHO LOSES': 'whoWins',
    'WHO WINS': 'whoWins',
    SCENARIOS: 'scenarios',
    CHECKPOINTS: 'checkpoints',
    DISCLAIMER: 'disclaimer',
  };

  const pattern = /\[([A-Z\s/]+)\]/g;
  const matches: { key: string; index: number }[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    matches.push({ key: match[1].trim(), index: match.index + match[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].key.length - 2 : text.length;
    const sectionKey = sectionMap[matches[i].key];
    if (sectionKey) {
      sections[sectionKey] = text.slice(start, end).trim();
    }
  }

  return sections;
}
