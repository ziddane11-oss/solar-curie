'use client';

import styles from './Form.module.css';

export default function TeacherPackForm({ teacherPack, onChange }) {
  const tp = teacherPack || {
    teacher_cert: [],
    other_certs: [],
    nice_pool: { registered: false, pool_region: '', pool_subject: '', pool_year: '' },
    school_target: { school_name: '', department: '', tasks: '', contract_reason: '', contract_start: '', contract_end: '' },
  };

  const mutate = (fn) => {
    const next = JSON.parse(JSON.stringify(tp));
    fn(next);
    onChange(next);
  };

  const update = (path, value) => mutate((d) => {
    const keys = path.split('.');
    let obj = d;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
  });

  const updateCert = (index, field, value) => mutate((d) => { d.teacher_cert[index][field] = value; });
  const addCert = () => mutate((d) => { d.teacher_cert.push({ cert_type: '', cert_subject: '', cert_number: '', cert_date: '', issuer: '' }); });
  const removeCert = (index) => mutate((d) => { d.teacher_cert.splice(index, 1); });

  const updateOtherCert = (index, field, value) => mutate((d) => { d.other_certs[index][field] = value; });
  const addOtherCert = () => mutate((d) => { d.other_certs.push({ cert_name: '', cert_number: '', cert_date: '', issuer: '' }); });
  const removeOtherCert = (index) => mutate((d) => { d.other_certs.splice(index, 1); });

  return (
    <div className={styles.section}>
      {/* 교원자격증 */}
      <h3 className={styles.sectionTitle}>교원자격증</h3>
      {tp.teacher_cert.map((cert, i) => (
        <div key={i}>
          <div className={styles.grid}>
            <label>
              <span className={styles.required}>자격 종류</span>
              <select value={cert.cert_type} onChange={(e) => updateCert(i, 'cert_type', e.target.value)}>
                <option value="">선택</option>
                <option value="정교사(1급)">정교사(1급)</option>
                <option value="정교사(2급)">정교사(2급)</option>
                <option value="준교사">준교사</option>
                <option value="전문상담교사(1급)">전문상담교사(1급)</option>
                <option value="전문상담교사(2급)">전문상담교사(2급)</option>
              </select>
            </label>
            <label>
              <span className={styles.required}>표시 과목</span>
              <input type="text" value={cert.cert_subject} onChange={(e) => updateCert(i, 'cert_subject', e.target.value)} placeholder="예: 수학" />
            </label>
            <label>
              자격증 번호
              <input type="text" value={cert.cert_number} onChange={(e) => updateCert(i, 'cert_number', e.target.value)} />
            </label>
            <label>
              취득일
              <input type="date" value={cert.cert_date} onChange={(e) => updateCert(i, 'cert_date', e.target.value)} />
            </label>
            <label>
              발급 기관
              <input type="text" value={cert.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} />
            </label>
          </div>
          {tp.teacher_cert.length > 1 && (
            <button type="button" className={styles.removeBtn} onClick={() => removeCert(i)}>삭제</button>
          )}
          <div className={styles.divider} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addCert}>+ 교원자격증 추가</button>

      {/* 기타 자격증 */}
      <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>기타 자격증</h3>
      {tp.other_certs.map((cert, i) => (
        <div key={i}>
          <div className={styles.grid}>
            <label>
              자격증명
              <input type="text" value={cert.cert_name} onChange={(e) => updateOtherCert(i, 'cert_name', e.target.value)} />
            </label>
            <label>
              번호
              <input type="text" value={cert.cert_number} onChange={(e) => updateOtherCert(i, 'cert_number', e.target.value)} />
            </label>
            <label>
              취득일
              <input type="date" value={cert.cert_date} onChange={(e) => updateOtherCert(i, 'cert_date', e.target.value)} />
            </label>
            <label>
              발급 기관
              <input type="text" value={cert.issuer} onChange={(e) => updateOtherCert(i, 'issuer', e.target.value)} />
            </label>
          </div>
          <button type="button" className={styles.removeBtn} onClick={() => removeOtherCert(i)}>삭제</button>
          <div className={styles.divider} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addOtherCert}>+ 기타 자격증 추가</button>

      {/* NICE 인력풀 */}
      <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>NICE 인력풀</h3>
      <div className={styles.grid}>
        <label className={styles.checkLabel} style={{ paddingTop: 0 }}>
          <input
            type="checkbox"
            checked={tp.nice_pool.registered}
            onChange={(e) => update('nice_pool.registered', e.target.checked)}
          />
          인력풀 등록 여부
        </label>
        <label>
          지역
          <input type="text" value={tp.nice_pool.pool_region} onChange={(e) => update('nice_pool.pool_region', e.target.value)} placeholder="예: 서울" />
        </label>
        <label>
          과목
          <input type="text" value={tp.nice_pool.pool_subject} onChange={(e) => update('nice_pool.pool_subject', e.target.value)} />
        </label>
        <label>
          등록 연도
          <input type="text" value={tp.nice_pool.pool_year} onChange={(e) => update('nice_pool.pool_year', e.target.value)} placeholder="2026" />
        </label>
      </div>

      {/* 지원 학교 정보 */}
      <details className={styles.collapsible}>
        <summary className={styles.collapsibleSummary}>지원 학교 정보(고급/선택)</summary>
        <div className={styles.grid} style={{ marginTop: 16 }}>
          <label>
            학교명
            <input type="text" value={tp.school_target.school_name} onChange={(e) => update('school_target.school_name', e.target.value)} />
          </label>
          <label>
            교과/부서
            <input type="text" value={tp.school_target.department} onChange={(e) => update('school_target.department', e.target.value)} />
          </label>
          <label className={styles.full}>
            담당 업무
            <input type="text" value={tp.school_target.tasks} onChange={(e) => update('school_target.tasks', e.target.value)} />
          </label>
          <label className={styles.full}>
            계약 사유
            <input type="text" value={tp.school_target.contract_reason} onChange={(e) => update('school_target.contract_reason', e.target.value)} placeholder="예: 산전후 휴가 대체" />
          </label>
          <label>
            계약 시작일
            <input type="date" value={tp.school_target.contract_start} onChange={(e) => update('school_target.contract_start', e.target.value)} />
          </label>
          <label>
            계약 종료일
            <input type="date" value={tp.school_target.contract_end} onChange={(e) => update('school_target.contract_end', e.target.value)} />
          </label>
        </div>
      </details>
    </div>
  );
}
