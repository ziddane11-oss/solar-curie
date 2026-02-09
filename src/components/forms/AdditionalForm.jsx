'use client';

import SectionHeader from '../ui/SectionHeader';
import styles from './Form.module.css';

export default function AdditionalForm({ data, onChange }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={styles.section}>
      <SectionHeader title="기타" />
      <div className={styles.grid}>
        <label>
          장애 여부/등급
          <input value={data.disability} onChange={(e) => update('disability', e.target.value)} placeholder="해당 없음" />
        </label>
        <label>
          보훈 대상
          <input value={data.veteran} onChange={(e) => update('veteran', e.target.value)} placeholder="해당 없음" />
        </label>
        <label>
          <span className={styles.checkLabel}>
            <input type="checkbox" checked={data.multi_cultural} onChange={(e) => update('multi_cultural', e.target.checked)} />
            다문화 가정
          </span>
        </label>
      </div>
    </div>
  );
}
