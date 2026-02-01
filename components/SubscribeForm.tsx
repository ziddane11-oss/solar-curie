'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubscribeFormProps {
  sourceUtm?: string;
}

export function SubscribeForm({ sourceUtm }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source_utm: sourceUtm }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('구독 완료! 매일 아침 인사이트를 보내드릴게요.');
        setEmail('');

        // Track signup event
        fetch('/api/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'signup_success',
            meta: { source: sourceUtm || 'direct' },
          }),
        });
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.error || '오류가 발생했습니다.');
      }
    } catch {
      setStatus('error');
      setMessage('네트워크 오류가 발생했습니다.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <Input
        type="email"
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'loading' || status === 'success'}
        required
      />
      <Button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? '...' : status === 'success' ? '완료' : '구독'}
      </Button>
      {message && (
        <p
          className={`text-sm mt-1 ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
