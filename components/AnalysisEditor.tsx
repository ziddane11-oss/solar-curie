'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisEditorProps {
  analysisId: string;
  initialText: string;
  initialToneLevel: number;
  adminToken: string;
  onSaved?: () => void;
}

export function AnalysisEditor({
  analysisId,
  initialText,
  initialToneLevel,
  adminToken,
  onSaved,
}: AnalysisEditorProps) {
  const [text, setText] = useState(initialText);
  const [toneLevel, setToneLevel] = useState(initialToneLevel);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/analysis/${analysisId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ analysis_text: text, tone_level: toneLevel }),
      });

      if (res.ok) {
        setMessage('저장 완료');
        onSaved?.();
      } else {
        const data = await res.json();
        setMessage(`오류: ${data.error}`);
      }
    } catch {
      setMessage('네트워크 오류');
    } finally {
      setSaving(false);
    }
  }

  // Simple preview: render the sections with basic formatting
  const previewSections = text.split(/\[([A-Z\s/]+)\]/).filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">톤 레벨:</label>
          {[1, 2, 3].map((level) => (
            <Button
              key={level}
              variant={toneLevel === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setToneLevel(level)}
            >
              {level === 1 ? '보수적' : level === 2 ? '균형' : '공격적'}
            </Button>
          ))}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">미리보기</h3>
        <div className="space-y-3 text-sm whitespace-pre-wrap">
          {previewSections.map((section, i) => {
            const isHeader = /^[A-Z\s/]+$/.test(section.trim());
            if (isHeader) {
              return (
                <h4 key={i} className="font-bold text-primary mt-4">
                  [{section.trim()}]
                </h4>
              );
            }
            return (
              <div key={i} className="text-muted-foreground">
                {section.trim()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
