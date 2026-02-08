'use client';

import RepeatableSection from '../ui/RepeatableSection';
import styles from './Form.module.css';

const DEGREE_OPTIONS = ['', '전문학사', '학사', '석사', '박사'];
const STATUS_OPTIONS = ['', '졸업', '재학', '수료', '중퇴'];

export default function EducationForm({ items, onChange }) {
  const update = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <RepeatableSection
      title="학력"
      items={items}
      onAdd={() => onChange([...items, { school: '', major: '', degree: '', status: '', start_date: '', end_date: '', thesis_title: '' }])}
      onRemove={(i) => onChange(items.filter((_, idx) => idx !== i))}
      renderItem={(item, index) => (
        <>
          <label className={styles.required}>
            학교명
            <input value={item.school} onChange={(e) => update(index, 'school', e.target.value)} />
          </label>
          <label className={styles.required}>
            전공
            <input value={item.major} onChange={(e) => update(index, 'major', e.target.value)} />
          </label>
          <label>
            학위
            <select value={item.degree} onChange={(e) => update(index, 'degree', e.target.value)}>
              {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d || '선택'}</option>)}
            </select>
          </label>
          <label>
            상태
            <select value={item.status} onChange={(e) => update(index, 'status', e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || '선택'}</option>)}
            </select>
          </label>
          <label>
            입학일
            <input type="month" value={item.start_date} onChange={(e) => update(index, 'start_date', e.target.value)} />
          </label>
          <label>
            졸업일
            <input type="month" value={item.end_date} onChange={(e) => update(index, 'end_date', e.target.value)} />
          </label>
          <label className={styles.full}>
            논문 제목
            <input value={item.thesis_title} onChange={(e) => update(index, 'thesis_title', e.target.value)} placeholder="석사/박사인 경우" />
          </label>
        </>
      )}
    />
  );
}
