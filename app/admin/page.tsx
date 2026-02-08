'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminArticleList } from '@/components/AdminArticleList';

interface Stats {
  articles: { total: number; today: number };
  analyses: { draft: number; published: number; today: number };
  subscriptions: { total: number };
  feedback: { total: number; too_much_count: number; too_much_rate: number };
  recent_errors: Array<{
    id: string;
    event_type: string;
    meta: Record<string, unknown>;
    created_at: string;
  }>;
  last_ingest: {
    started_at: string;
    status: string;
    result: Record<string, unknown>;
  } | null;
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<Stats | null>(null);

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
        localStorage.removeItem('adminToken');
        setAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // stats are optional, fail silently
    }
  }, [adminToken]);

  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? localStorage.getItem('adminToken')
        : null;
    if (saved) {
      setAdminToken(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadArticles();
      loadStats();
    }
  }, [authenticated, statusFilter, loadArticles, loadStats]);

  async function handleIngest() {
    setIngesting(true);
    try {
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          `수집 완료: 총 ${data.total}건, 신규 ${data.inserted}건, 스킵 ${data.skipped}건`
        );
        loadArticles();
        loadStats();
      } else {
        alert(`수집 실패: ${data.error}`);
      }
    } finally {
      setIngesting(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        localStorage.setItem('adminToken', adminToken);
        setAuthenticated(true);
      } else if (res.status === 401) {
        setAuthError('토큰이 올바르지 않습니다.');
        localStorage.removeItem('adminToken');
      } else {
        setAuthError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setAuthError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setAuthenticated(false);
    setStats(null);
    setArticles([]);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">관리자 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="password"
                placeholder="비밀번호 입력"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                autoFocus
              />
              {authError && (
                <p className="text-sm text-red-600">{authError}</p>
              )}
              <Button type="submit" className="w-full" disabled={authLoading || !adminToken}>
                {authLoading ? '확인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleIngest} disabled={ingesting}>
            {ingesting ? 'RSS 수집 중...' : 'RSS 수집'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                기사 수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.articles.total}</div>
              <p className="text-xs text-muted-foreground">
                오늘 +{stats.articles.today}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                해설
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.analyses.published}
              </div>
              <p className="text-xs text-muted-foreground">
                발행 {stats.analyses.published} / 초안 {stats.analyses.draft}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                구독자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.subscriptions.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                피드백 &quot;과함&quot; 비율
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.feedback.too_much_rate}%
              </div>
              <p className="text-xs text-muted-foreground">
                총 {stats.feedback.total}건 중{' '}
                {stats.feedback.too_much_count}건
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Ingest Info */}
      {stats?.last_ingest && (
        <div className="mb-6 p-3 border rounded-md text-sm">
          <span className="font-medium">마지막 수집:</span>{' '}
          {new Date(stats.last_ingest.started_at).toLocaleString('ko-KR')}{' '}
          <Badge
            variant={
              stats.last_ingest.status === 'completed'
                ? 'default'
                : stats.last_ingest.status === 'running'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {stats.last_ingest.status}
          </Badge>
        </div>
      )}

      {/* Recent Errors */}
      {stats?.recent_errors && stats.recent_errors.length > 0 && (
        <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
          <h3 className="font-semibold text-red-800 mb-2">
            최근 에러 ({stats.recent_errors.length}건)
          </h3>
          <div className="space-y-1">
            {stats.recent_errors.slice(0, 5).map((err) => (
              <div key={err.id} className="text-xs text-red-700">
                <span className="font-mono">{err.event_type}</span> -{' '}
                {new Date(err.created_at).toLocaleString('ko-KR')}
              </div>
            ))}
          </div>
        </div>
      )}

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
          onRefresh={() => {
            loadArticles();
            loadStats();
          }}
        />
      )}
    </div>
  );
}
