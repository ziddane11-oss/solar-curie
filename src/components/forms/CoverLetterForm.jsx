'use client';

import { useCallback, useRef } from 'react';
import styles from './Form.module.css';

function autoGrow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

export default function CoverLetterForm({ sections, onChange }) {
  const textareaRefs = useRef([]);

  const updateSection = (index, body) => {
    const next = [...sections];
    next[index] = { ...next[index], body };
    onChange(next);
  };

  const handleInput = useCallback((index, e) => {
    autoGrow(e.target);
    updateSection(index, e.target.value);
  }, [sections, onChange]);

  const setRef = useCallback((index, el) => {
    textareaRefs.current[index] = el;
    if (el) autoGrow(el);
  }, []);

  return (
    <div className={styles.coverLetterList}>
      {sections.map((section, index) => {
        const charCount = section.body.length;
        const max = section.max_length;
        const ratio = max > 0 ? charCount / max : 0;
        const isOver = max > 0 && charCount > max;
        const isWarn = !isOver && ratio >= 0.8;

        const countClass = [
          styles.charCount,
          isOver ? styles.charOver : '',
          isWarn ? styles.charWarn : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={section.id} className={styles.textBlock}>
            <div className={styles.textHeader}>
              <div className={styles.titleGroup}>
                <span className={styles.sectionIndex}>{index + 1}</span>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
              </div>
              {max > 0 && (
                <span className={countClass}>
                  {charCount} / {max}자
                </span>
              )}
            </div>
            <textarea
              ref={(el) => setRef(index, el)}
              className={styles.textarea}
              value={section.body}
              onInput={(e) => handleInput(index, e)}
              onChange={() => {}}
              placeholder={`${section.title}을(를) 입력하세요...`}
              rows={6}
            />
          </div>
        );
      })}
    </div>
  );
}
