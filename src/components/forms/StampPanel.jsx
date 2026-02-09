'use client';

import { useEffect, useRef, useState } from 'react';
import { generateStampDataURL, STAMP_SIZES } from '@/lib/stamp';
import styles from './Form.module.css';

const SIZE_OPTIONS = [
  { key: 'S', label: 'S' },
  { key: 'M', label: 'M' },
  { key: 'L', label: 'L' },
];

/**
 * Stamp settings panel with toggle, name input, size selector, and live preview.
 *
 * @param {Object} props
 * @param {Object} props.settings - { enabled, name, size }
 * @param {string} props.profileName - default name from profile
 * @param {(settings: Object) => void} props.onChange
 */
export default function StampPanel({ settings, profileName, onChange }) {
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);

  const { enabled = false, name = '', size = 'M' } = settings || {};
  const displayName = name || profileName || '';

  // Regenerate preview when inputs change
  useEffect(() => {
    if (enabled && displayName) {
      setPreview(generateStampDataURL(displayName, size));
    } else {
      setPreview(null);
    }
  }, [enabled, displayName, size]);

  const update = (patch) => onChange({ enabled, name, size, ...patch });

  return (
    <div className={styles.stampSection}>
      <h3 className={styles.sectionTitle}>전자도장</h3>

      <label className={styles.stampToggle}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span>전자도장 삽입</span>
      </label>

      {enabled && (
        <div className={styles.stampControls}>
          <label>
            도장 이름
            <input
              type="text"
              value={name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={profileName || '이름 입력'}
            />
          </label>

          <div className={styles.stampSizeRow}>
            <span className={styles.stampSizeLabel}>크기</span>
            <div className={styles.stampSizeGroup}>
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`${styles.stampSizeBtn} ${size === opt.key ? styles.stampSizeBtnActive : ''}`}
                  onClick={() => update({ size: opt.key })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.stampPreviewBox}>
            <span className={styles.stampPreviewLabel}>미리보기</span>
            <div className={styles.stampPreviewArea}>
              {preview ? (
                <img
                  src={preview}
                  alt="도장 미리보기"
                  width={STAMP_SIZES[size]}
                  height={STAMP_SIZES[size]}
                />
              ) : (
                <span className={styles.muted}>이름을 입력하세요</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
