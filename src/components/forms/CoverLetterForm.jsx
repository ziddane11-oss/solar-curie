'use client';

import styles from './Form.module.css';

export default function CoverLetterForm({ sections, onChange }) {
  const updateSection = (index, body) => {
    const next = [...sections];
    next[index] = { ...next[index], body };
    onChange(next);
  };

  return (
    <div className={styles.section}>
      {sections.map((section, index) => {
        const charCount = section.body.length;
        const isOver = section.max_length > 0 && charCount > section.max_length;

        return (
          <div key={section.id} className={styles.textBlock}>
            <div className={styles.textHeader}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              {section.max_length > 0 && (
                <span className={`${styles.charCount} ${isOver ? styles.charOver : ''}`}>
                  {charCount} / {section.max_length}자
                </span>
              )}
            </div>
            <textarea
              className={styles.textarea}
              value={section.body}
              onChange={(e) => updateSection(index, e.target.value)}
              placeholder={`${section.title}을(를) 입력하세요...`}
              rows={6}
            />
          </div>
        );
      })}
    </div>
  );
}
