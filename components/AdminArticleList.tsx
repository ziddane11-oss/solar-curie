'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Analysis {
  id: string;
  status: string;
  analysis_text: string;
  tone_level: number;
  risk_flags: Record<string, unknown>;
}

interface ArticleItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string | null;
  created_at: string;
  analyses: Analysis[];
}

interface AdminArticleListProps {
  articles: ArticleItem[];
  adminToken: string;
  onRefresh: () => void;
}

export function AdminArticleList({
  articles,
  adminToken,
  onRefresh,
}: AdminArticleListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function handleGenerateDraft(articleId: string) {
    setLoadingAction(`generate-${articleId}`);
    try {
      const res = await fetch('/api/admin/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ article_id: articleId }),
      });
      if (res.ok) {
        onRefresh();
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePublish(analysisId: string) {
    setLoadingAction(`publish-${analysisId}`);
    try {
      const res = await fetch(`/api/admin/publish/${analysisId}`, {
        method: 'POST',
        headers: {
          'x-admin-token': adminToken,
        },
      });
      if (res.ok) {
        onRefresh();
      }
    } finally {
      setLoadingAction(null);
    }
  }

  function getStatusBadge(analyses: Analysis[]) {
    if (analyses.length === 0) return <Badge variant="outline">미생성</Badge>;
    const published = analyses.find((a) => a.status === 'published');
    if (published) return <Badge className="bg-green-600">발행됨</Badge>;
    return <Badge variant="secondary">초안</Badge>;
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const latestAnalysis = article.analyses[0];
        const hasRisk =
          latestAnalysis?.risk_flags &&
          Object.values(latestAnalysis.risk_flags).some(Boolean);

        return (
          <Card key={article.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{article.source}</Badge>
                  {getStatusBadge(article.analyses)}
                  {hasRisk && <Badge variant="destructive">위험</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(article.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <CardTitle className="text-base">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {article.analyses.length === 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleGenerateDraft(article.id)}
                    disabled={loadingAction === `generate-${article.id}`}
                  >
                    {loadingAction === `generate-${article.id}`
                      ? '생성 중...'
                      : '초안 생성'}
                  </Button>
                )}
                {latestAnalysis && latestAnalysis.status === 'draft' && (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/admin/edit/${latestAnalysis.id}`}>수정</a>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePublish(latestAnalysis.id)}
                      disabled={
                        loadingAction === `publish-${latestAnalysis.id}`
                      }
                    >
                      {loadingAction === `publish-${latestAnalysis.id}`
                        ? '발행 중...'
                        : '발행'}
                    </Button>
                  </>
                )}
                {latestAnalysis && latestAnalysis.status === 'published' && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/admin/edit/${latestAnalysis.id}`}>수정</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
