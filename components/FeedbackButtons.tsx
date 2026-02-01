'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FeedbackButtonsProps {
  articleId: string;
}

const CHOICES = [
  { value: 'agree', label: '동의', icon: '👍' },
  { value: 'disagree', label: '반대', icon: '👎' },
  { value: 'too_much', label: '과함', icon: '😤' },
  { value: 'fun', label: '재밌음', icon: '😄' },
] as const;

export function FeedbackButtons({ articleId }: FeedbackButtonsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(choice: string) {
    if (selected) return;
    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, choice }),
      });

      if (res.ok) {
        setSelected(choice);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CHOICES.map(({ value, label, icon }) => (
        <Button
          key={value}
          variant={selected === value ? 'default' : 'outline'}
          size="sm"
          disabled={loading || (selected !== null && selected !== value)}
          onClick={() => handleFeedback(value)}
          className="text-sm"
        >
          {icon} {label}
        </Button>
      ))}
    </div>
  );
}
