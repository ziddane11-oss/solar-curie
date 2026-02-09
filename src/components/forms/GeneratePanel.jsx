'use client';

import { useMemo, useState } from 'react';
import styles from './Form.module.css';

export default function GeneratePanel({ templates, profileName, onGenerate, isGenerating, status, downloadUrl, log }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [file, setFile] = useState(null);

  // Auto-select first template
  useMemo(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const canGenerate = file && selectedTemplate && !isGenerating;
  const disabledReason = !selectedTemplate
    ? '템플릿을 선택하세요'
    : !file
      ? '지원서 파일을 업로드하세요'
      : '';

  const handleGenerate = () => {
    onGenerate({ templateId: selectedTemplate, file });
  };

  const isSuccess = status === 'PDF 생성 완료';
  const isError = status?.includes('실패');

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
      <p className={styles.muted} style={{ marginTop: -8 }}>
        학교/교육청 양식은 조금씩 다를 수 있습니다. 현재는 샘플 템플릿을 제공합니다.
      </p>

      <div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {isGenerating ? 'PDF 생성 중...' : 'PDF 생성'}
        </button>
        {!canGenerate && !isGenerating && disabledReason && (
          <p className={styles.muted} style={{ marginTop: 6, fontSize: 13 }}>{disabledReason}</p>
        )}
      </div>

      {/* Result area */}
      {isSuccess && downloadUrl && (
        <div className={styles.successBlock}>
          <p className={styles.successText}>PDF가 성공적으로 생성되었습니다.</p>
          <a className={styles.downloadLink} href={downloadUrl}>result.pdf 다운로드</a>
        </div>
      )}

      {isError && (
        <div className={styles.errorBlock}>
          <p className={styles.errorText}>{status}</p>
          <p className={styles.muted}>데이터는 그대로 유지됩니다. 파일이나 설정을 확인 후 다시 시도하세요.</p>
        </div>
      )}

      {!isSuccess && !isError && (
        <div className={styles.resultBlock}>
          <h3 className={styles.sectionTitle}>결과</h3>
          {downloadUrl ? (
            <a className={styles.downloadLink} href={downloadUrl}>result.pdf 다운로드</a>
          ) : (
            <p className={styles.muted}>아직 생성된 PDF가 없습니다.</p>
          )}
        </div>
      )}

      <div className={styles.resultBlock}>
        <h3 className={styles.sectionTitle}>로그</h3>
        <pre className={styles.logPre}>{log || '로그가 아직 없습니다.'}</pre>
      </div>
    </div>
  );
}
