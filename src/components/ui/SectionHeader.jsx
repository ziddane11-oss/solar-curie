'use client';

import styles from './SectionHeader.module.css';

export default function SectionHeader({ title, complete }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        {complete && <span className={styles.badge}>&#10003; 완료</span>}
      </div>
    </div>
  );
}
