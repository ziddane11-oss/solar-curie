'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnalysisEditor } from '@/components/AnalysisEditor';

interface Analysis {
  id: string;
  article_id: string;
  status: string;
  analysis_text: string;
  tone_level: number;
  risk_flags: Record<string, unknown>;
}

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [adminToken, setAdminToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Try to get token from sessionStorage
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
    if (saved) {
      setAdminToken(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated && adminToken) {
      loadAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  async function loadAnalysis() {
    setLoading(true);
    try {
      // Fetch analysis directly - we need an endpoint for this
      // For now, use the admin articles endpoint and find the analysis
      const res = await fetch('/api/admin/articles', {
        headers: { 'x-admin-token': adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        // Find the analysis across all articles
        for (const article of data.articles || []) {
          const found = (article.analyses || []).find(
            (a: Analysis) => a.id === id
          );
          if (found) {
            setAnalysis(found);
            break;
          }
        }
      }
    } finally {
      setLoading(false);
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
        sessionStorage.setItem('adminToken', adminToken);
        setAuthenticated(true);
      } else if (res.status === 401) {
        setAuthError('토큰이 올바르지 않습니다.');
        sessionStorage.removeItem('adminToken');
      } else {
        setAuthError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setAuthError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setAuthLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6">Admin 로그인</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="password"
            placeholder="Admin Token"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
          />
          {authError && (
            <p className="text-sm text-red-600">{authError}</p>
          )}
          <Button type="submit" className="w-full" disabled={authLoading || !adminToken}>
            {authLoading ? '확인 중...' : '접속'}
          </Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        해설을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">해설 수정</h1>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          돌아가기
        </Button>
      </div>

      <AnalysisEditor
        analysisId={analysis.id}
        initialText={analysis.analysis_text}
        initialToneLevel={analysis.tone_level}
        adminToken={adminToken}
        onSaved={loadAnalysis}
      />
    </div>
  );
}
