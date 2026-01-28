'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminArticleList } from '@/components/AdminArticleList';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/articles'
          : `/api/admin/articles?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      } else if (res.status === 401) {
        setAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, statusFilter]);

  useEffect(() => {
    if (authenticated) {
      loadArticles();
    }
  }, [authenticated, statusFilter, loadArticles]);

  async function handleIngest() {
    setIngesting(true);
    try {
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        alert(
          `수집 완료: 총 ${data.total}건, 신규 ${data.inserted}건, 스킵 ${data.skipped}건`
        );
        loadArticles();
      }
    } finally {
      setIngesting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6">Admin 로그인</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAuthenticated(true);
          }}
          className="space-y-4"
        >
          <Input
            type="password"
            placeholder="Admin Token"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
          />
          <Button type="submit" className="w-full">
            접속
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleIngest} disabled={ingesting}>
          {ingesting ? 'RSS 수집 중...' : 'RSS 수집'}
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: '전체' },
          { value: 'draft', label: '초안' },
          { value: 'published', label: '발행됨' },
        ].map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : (
        <AdminArticleList
          articles={articles}
          adminToken={adminToken}
          onRefresh={loadArticles}
        />
      )}
    </div>
  );
}
