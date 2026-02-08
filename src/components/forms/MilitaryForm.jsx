'use client';

import styles from './Form.module.css';

const STATUS_OPTIONS = ['', '필', '미필', '면제', '해당없음'];

export default function MilitaryForm({ data, onChange }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const showDetails = data.status === '필';

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>병역사항</h3>
      <div className={styles.grid}>
        <label>
          병역 구분
          <select value={data.status} onChange={(e) => update('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || '선택'}</option>)}
          </select>
        </label>
        {showDetails && (
          <>
            <label>
              군별
              <input value={data.branch} onChange={(e) => update('branch', e.target.value)} placeholder="육군, 해군, 공군 등" />
            </label>
            <label>
              계급
              <input value={data.rank} onChange={(e) => update('rank', e.target.value)} />
            </label>
            <label>
              복무 시작
              <input type="date" value={data.start_date} onChange={(e) => update('start_date', e.target.value)} />
            </label>
            <label>
              복무 종료
              <input type="date" value={data.end_date} onChange={(e) => update('end_date', e.target.value)} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
