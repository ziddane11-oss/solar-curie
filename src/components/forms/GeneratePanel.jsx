'use client';

import { useMemo, useState } from 'react';
import StampPanel from './StampPanel';
import { generateStampDataURL, dataURLtoBytes } from '@/lib/stamp';
import { postProcessPDF, splitCareerEntries } from '@/lib/pdf-postprocess';
import { buildDataContext } from '@/lib/mapping';
import styles from './Form.module.css';

export default function GeneratePanel({
  templates,
  onGenerate,
  isGenerating,
  status,
  downloadUrl,
  log,
  profile,
  coverLetter,
  stampSettings,
  onStampChange,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [file, setFile] = useState(null);
  const [processedUrl, setProcessedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select first template
  useMemo(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  // Selected template config
  const templateConfig = useMemo(
    () => templates.find((t) => t.id === selectedTemplate) || {},
    [templates, selectedTemplate],
  );

  // Career overflow detection
  const overflowInfo = useMemo(() => {
    if (!profile?.career || !templateConfig.maxCareerRows) return null;
    const ctx = buildDataContext(profile, coverLetter);
    const { overflow } = splitCareerEntries(ctx.career, templateConfig.maxCareerRows);
    return overflow.length > 0 ? overflow : null;
  }, [profile, coverLetter, templateConfig]);

  const handleGenerate = () => {
    setProcessedUrl('');
    onGenerate({ templateId: selectedTemplate, file });
  };

  // Post-process: overflow pages + stamp overlay
  const handlePostProcess = async () => {
    if (!downloadUrl) return;
    setIsProcessing(true);

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('PDF fetch failed');
      const pdfBytes = new Uint8Array(await res.arrayBuffer());

      const ctx = buildDataContext(profile, coverLetter);
      const maxRows = templateConfig.maxCareerRows || 0;
      const { overflow: overflowEntries } = splitCareerEntries(ctx.career, maxRows);

      let stampPngBytes = null;
      if (stampSettings?.enabled) {
        const stampName = stampSettings.name || profile?.personal?.name || '';
        if (stampName) {
          const dataURL = generateStampDataURL(stampName, stampSettings.size);
          stampPngBytes = dataURLtoBytes(dataURL);
        }
      }

      const processed = await postProcessPDF({
        pdfBytes,
        overflowEntries: overflowEntries.length > 0 ? overflowEntries : null,
        stampPngBytes: stampSettings?.enabled ? stampPngBytes : null,
        stampAnchors: stampSettings?.enabled ? (templateConfig.stampAnchors || []) : [],
      });

      const blob = new Blob([processed], { type: 'application/pdf' });
      setProcessedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('PDF post-process error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalUrl = processedUrl || downloadUrl;
  const needsPostProcess = downloadUrl && !processedUrl && (overflowInfo || stampSettings?.enabled);

  return (
    <div className={styles.section}>
      <div className={styles.grid}>
        <label>
          템플릿 선택
          <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.displayName || t.name || t.id}</option>
            ))}
          </select>
        </label>
        <label>
          지원서 파일 (.hwp/.hwpx)
          <input type="file" accept=".hwp,.hwpx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {overflowInfo && (
        <div className={styles.overflowBadge}>
          경력 {profile.career.length}건 중 {overflowInfo.length}건이 추가 페이지에 출력됩니다
        </div>
      )}

      <StampPanel
        settings={stampSettings}
        profileName={profile?.personal?.name || ''}
        onChange={onStampChange}
      />

      <button
        type="button"
        className={styles.primaryBtn}
        onClick={handleGenerate}
        disabled={isGenerating || !file || !selectedTemplate}
      >
        {isGenerating ? '생성 중...' : 'PDF 생성'}
      </button>

      {needsPostProcess && (
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handlePostProcess}
          disabled={isProcessing}
        >
          {isProcessing ? '후처리 중...' : '도장·추가페이지 적용'}
        </button>
      )}

      <div className={styles.resultBlock}>
        <h3 className={styles.sectionTitle}>결과</h3>
        {finalUrl ? (
          <a
            className={styles.downloadLink}
            href={finalUrl}
            download={processedUrl ? 'result.pdf' : undefined}
          >
            result.pdf 다운로드{processedUrl ? ' (후처리 완료)' : ''}
          </a>
        ) : (
          <p className={styles.muted}>아직 생성된 PDF가 없습니다.</p>
        )}
      </div>

      <div className={styles.resultBlock}>
        <h3 className={styles.sectionTitle}>로그</h3>
        <pre className={styles.logPre}>{log || '로그가 아직 없습니다.'}</pre>
      </div>
    </div>
  );
}
