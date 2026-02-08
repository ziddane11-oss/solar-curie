'use client';

import RepeatableSection from '../ui/RepeatableSection';
import styles from './Form.module.css';

const CERT_TYPES = ['', '정교사(1급)', '정교사(2급)', '준교사', '전문상담교사(1급)', '전문상담교사(2급)', '사서교사', '보건교사', '영양교사'];

export default function CertificationForm({ teacherCerts, otherCerts, onChangeTeacher, onChangeOther }) {
  const updateTeacher = (index, field, value) => {
    const next = [...teacherCerts];
    next[index] = { ...next[index], [field]: value };
    onChangeTeacher(next);
  };

  const updateOther = (index, field, value) => {
    const next = [...otherCerts];
    next[index] = { ...next[index], [field]: value };
    onChangeOther(next);
  };

  return (
    <div className={styles.section}>
      <RepeatableSection
        title="교원자격증"
        items={teacherCerts}
        onAdd={() => onChangeTeacher([...teacherCerts, { cert_type: '', cert_subject: '', cert_number: '', cert_date: '', issuer: '' }])}
        onRemove={(i) => onChangeTeacher(teacherCerts.filter((_, idx) => idx !== i))}
        renderItem={(item, index) => (
          <>
            <label className={styles.required}>
              자격 종류
              <select value={item.cert_type} onChange={(e) => updateTeacher(index, 'cert_type', e.target.value)}>
                {CERT_TYPES.map((t) => (
                  <option key={t} value={t}>{t || '선택'}</option>
                ))}
              </select>
            </label>
            <label className={styles.required}>
              표시 과목
              <input value={item.cert_subject} onChange={(e) => updateTeacher(index, 'cert_subject', e.target.value)} />
            </label>
            <label>
              자격증 번호
              <input value={item.cert_number} onChange={(e) => updateTeacher(index, 'cert_number', e.target.value)} />
            </label>
            <label>
              취득일
              <input type="date" value={item.cert_date} onChange={(e) => updateTeacher(index, 'cert_date', e.target.value)} />
            </label>
            <label>
              발급 기관
              <input value={item.issuer} onChange={(e) => updateTeacher(index, 'issuer', e.target.value)} />
            </label>
          </>
        )}
      />

      <div className={styles.divider} />

      <RepeatableSection
        title="기타 자격증"
        items={otherCerts.length > 0 ? otherCerts : [{ cert_name: '', cert_number: '', cert_date: '', issuer: '' }]}
        onAdd={() => onChangeOther([...otherCerts, { cert_name: '', cert_number: '', cert_date: '', issuer: '' }])}
        onRemove={(i) => onChangeOther(otherCerts.filter((_, idx) => idx !== i))}
        renderItem={(item, index) => (
          <>
            <label>
              자격증명
              <input value={item.cert_name} onChange={(e) => updateOther(index, 'cert_name', e.target.value)} />
            </label>
            <label>
              번호
              <input value={item.cert_number} onChange={(e) => updateOther(index, 'cert_number', e.target.value)} />
            </label>
            <label>
              취득일
              <input type="date" value={item.cert_date} onChange={(e) => updateOther(index, 'cert_date', e.target.value)} />
            </label>
            <label>
              발급 기관
              <input value={item.issuer} onChange={(e) => updateOther(index, 'issuer', e.target.value)} />
            </label>
          </>
        )}
      />
    </div>
  );
}
