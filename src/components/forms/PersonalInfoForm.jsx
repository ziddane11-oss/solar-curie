'use client';

import SectionHeader from '../ui/SectionHeader';
import styles from './Form.module.css';

const GENDER_OPTIONS = ['', '남', '여'];

export default function PersonalInfoForm({ data, complete, onChange }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={styles.section}>
      <SectionHeader title="인적사항" complete={complete} />
      <div className={styles.grid}>
        <label className={styles.required}>
          이름
          <input value={data.name} onChange={(e) => update('name', e.target.value)} />
        </label>
        <label>
          한자 이름
          <input value={data.name_hanja} onChange={(e) => update('name_hanja', e.target.value)} placeholder="선택" />
        </label>
        <label className={styles.required}>
          생년월일
          <input type="date" value={data.birth} onChange={(e) => update('birth', e.target.value)} />
        </label>
        <label>
          성별
          <select value={data.gender} onChange={(e) => update('gender', e.target.value)}>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>{g || '선택'}</option>
            ))}
          </select>
        </label>
        <label className={styles.required}>
          연락처
          <input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="010-0000-0000" />
        </label>
        <label>
          보조 연락처
          <input value={data.phone_secondary} onChange={(e) => update('phone_secondary', e.target.value)} />
        </label>
        <label>
          이메일
          <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} />
        </label>
        <label>
          우편번호
          <input value={data.postal_code} onChange={(e) => update('postal_code', e.target.value)} />
        </label>
        <label className={`${styles.required} ${styles.full}`}>
          주소
          <input value={data.address} onChange={(e) => update('address', e.target.value)} />
        </label>
        <label className={styles.full}>
          상세주소
          <input value={data.address_detail} onChange={(e) => update('address_detail', e.target.value)} />
        </label>
      </div>
    </div>
  );
}
