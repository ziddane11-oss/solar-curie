'use client';

import { useMemo, useState } from 'react';
import styles from './Form.module.css';

export default function GeneratePanel({ templates, onGenerate, isGenerating, status, downloadUrl, log }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [file, setFile] = useState(null);

  // Auto-select first template
  useMemo(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const handleGenerate = () => {
    onGenerate({ templateId: selectedTemplate, file });
  };

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

      <button
        type="button"
        className={styles.primaryBtn}
        onClick={handleGenerate}
        disabled={isGenerating || !file || !selectedTemplate}
      >
        {isGenerating ? '생성 중...' : 'PDF 생성'}
      </button>

      <div className={styles.resultBlock}>
        <h3 className={styles.sectionTitle}>결과</h3>
        {downloadUrl ? (
          <a className={styles.downloadLink} href={downloadUrl}>result.pdf 다운로드</a>
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
