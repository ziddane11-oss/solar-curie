'use client';

import RepeatableSection from '../ui/RepeatableSection';
import styles from './Form.module.css';

export default function CareerForm({ items, onChange }) {
  const update = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <RepeatableSection
      title="경력사항"
      items={items}
      addLabel="+ 경력 추가"
      onAdd={() => onChange([...items, { institution: '', position: '', subject: '', start_date: '', end_date: '', is_contract: true, total_months: 0, notes: '' }])}
      onRemove={(i) => onChange(items.filter((_, idx) => idx !== i))}
      renderItem={(item, index) => (
        <>
          <label className={styles.required}>
            기관명
            <input value={item.institution} onChange={(e) => update(index, 'institution', e.target.value)} />
          </label>
          <label>
            직위
            <input value={item.position} onChange={(e) => update(index, 'position', e.target.value)} placeholder="기간제교사, 강사 등" />
          </label>
          <label>
            담당 교과
            <input value={item.subject} onChange={(e) => update(index, 'subject', e.target.value)} />
          </label>
          <label>
            시작일
            <input type="date" value={item.start_date} onChange={(e) => update(index, 'start_date', e.target.value)} />
          </label>
          <label>
            종료일
            <input type="date" value={item.end_date} onChange={(e) => update(index, 'end_date', e.target.value)} />
          </label>
          <label>
            <span className={styles.checkLabel}>
              <input type="checkbox" checked={item.is_contract} onChange={(e) => update(index, 'is_contract', e.target.checked)} />
              기간제
            </span>
          </label>
          <label className={styles.full}>
            비고
            <input value={item.notes} onChange={(e) => update(index, 'notes', e.target.value)} />
          </label>
        </>
      )}
    />
  );
}
