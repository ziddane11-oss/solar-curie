'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArticleCardProps {
  id: string;
  title: string;
  source: string;
  published_at: string | null;
  summary_fact: string | null;
}

export function ArticleCard({
  id,
  title,
  source,
  published_at,
  summary_fact,
}: ArticleCardProps) {
  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const firstBullet = summary_fact
    ? summary_fact.slice(0, 120) + (summary_fact.length > 120 ? '...' : '')
    : '';

  return (
    <Link href={`/article/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{source}</Badge>
            {formattedDate && (
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{title}</CardTitle>
        </CardHeader>
        {firstBullet && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{firstBullet}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
