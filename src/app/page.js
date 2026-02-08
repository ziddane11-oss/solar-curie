'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

const emptyProfile = {
  person: {
    name: '',
    birth: '',
    phone: '',
    email: '',
    address: ''
  },
  education: [{ school: '', major: '', period: '', degree: '' }],
  career: [{ school: '', period: '', subject: '', role: '', notes: '' }]
};

export default function Home() {
  const [profile, setProfile] = useState(emptyProfile);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [log, setLog] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || emptyProfile);
      }
    };

    const loadTemplates = async () => {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        if (data.templates?.length) {
          setSelectedTemplate(data.templates[0].id);
        }
      }
    };

    loadProfile();
    loadTemplates();
  }, []);

  const handlePersonChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      person: {
        ...prev.person,
        [field]: value
      }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setProfile((prev) => {
      const education = [...prev.education];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const handleCareerChange = (index, field, value) => {
    setProfile((prev) => {
      const career = [...prev.career];
      career[index] = { ...career[index], [field]: value };
      return { ...prev, career };
    });
  };

  const handleAddEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { school: '', major: '', period: '', degree: '' }]
    }));
  };

  const handleAddCareer = () => {
    setProfile((prev) => ({
      ...prev,
      career: [...prev.career, { school: '', period: '', subject: '', role: '', notes: '' }]
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatus('프로필 저장 중...');
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    setIsSaving(false);
    if (response.ok) {
      setStatus('프로필 저장 완료');
    } else {
      setStatus('프로필 저장 실패');
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setStatus('파일을 선택해 주세요.');
      return;
    }
    if (!selectedTemplate) {
      setStatus('템플릿을 선택해 주세요.');
      return;
    }

    setIsGenerating(true);
    setStatus('PDF 생성 중...');
    setDownloadUrl('');
    setLog('');

    const formData = new FormData();
    formData.append('template_id', selectedTemplate);
    formData.append('file', file);

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    setIsGenerating(false);

    if (response.ok && data.success) {
      setStatus('PDF 생성 완료');
      setDownloadUrl(data.downloadUrl);
      setLog(data.log || '');
    } else {
      setStatus('PDF 생성 실패');
      setLog(data.log || data.error || '알 수 없는 오류');
    }
  };

  const templateOptions = useMemo(() => {
    return templates.map((template) => (
      <option key={template.id} value={template.id}>
        {template.name || template.id}
      </option>
    ));
  }, [templates]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>기간제 교사 지원서 자동 생성기</h1>
          <p>한글 양식 업로드 → 자동 채움 → PDF 다운로드</p>
        </div>
        <div className={styles.status}>{status}</div>
      </header>

      <main className={styles.main}>
        <section className={styles.panel}>
          <h2>기본 정보 (profile.json)</h2>
          <div className={styles.section}>
            <h3>인적사항</h3>
            <div className={styles.grid}>
              <label>
                이름
                <input
                  value={profile.person.name}
                  onChange={(event) => handlePersonChange('name', event.target.value)}
                />
              </label>
              <label>
                생년월일
                <input
                  value={profile.person.birth}
                  onChange={(event) => handlePersonChange('birth', event.target.value)}
                />
              </label>
              <label>
                휴대폰
                <input
                  value={profile.person.phone}
                  onChange={(event) => handlePersonChange('phone', event.target.value)}
                />
              </label>
              <label>
                이메일
                <input
                  value={profile.person.email}
                  onChange={(event) => handlePersonChange('email', event.target.value)}
                />
              </label>
              <label className={styles.full}>
                주소
                <input
                  value={profile.person.address}
                  onChange={(event) => handlePersonChange('address', event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>학력</h3>
              <button type="button" onClick={handleAddEducation}>
                + 항목 추가
              </button>
            </div>
            {profile.education.map((entry, index) => (
              <div key={`edu-${index}`} className={styles.card}>
                <label>
                  학교
                  <input
                    value={entry.school}
                    onChange={(event) => handleEducationChange(index, 'school', event.target.value)}
                  />
                </label>
                <label>
                  전공
                  <input
                    value={entry.major}
                    onChange={(event) => handleEducationChange(index, 'major', event.target.value)}
                  />
                </label>
                <label>
                  기간
                  <input
                    value={entry.period}
                    onChange={(event) => handleEducationChange(index, 'period', event.target.value)}
                  />
                </label>
                <label>
                  학위
                  <input
                    value={entry.degree}
                    onChange={(event) => handleEducationChange(index, 'degree', event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>경력</h3>
              <button type="button" onClick={handleAddCareer}>
                + 항목 추가
              </button>
            </div>
            {profile.career.map((entry, index) => (
              <div key={`career-${index}`} className={styles.card}>
                <label>
                  학교/기관
                  <input
                    value={entry.school}
                    onChange={(event) => handleCareerChange(index, 'school', event.target.value)}
                  />
                </label>
                <label>
                  기간
                  <input
                    value={entry.period}
                    onChange={(event) => handleCareerChange(index, 'period', event.target.value)}
                  />
                </label>
                <label>
                  과목
                  <input
                    value={entry.subject}
                    onChange={(event) => handleCareerChange(index, 'subject', event.target.value)}
                  />
                </label>
                <label>
                  역할
                  <input
                    value={entry.role}
                    onChange={(event) => handleCareerChange(index, 'role', event.target.value)}
                  />
                </label>
                <label className={styles.full}>
                  특이사항
                  <input
                    value={entry.notes}
                    onChange={(event) => handleCareerChange(index, 'notes', event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>

          <button className={styles.primary} type="button" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? '저장 중...' : '프로필 저장'}
          </button>
        </section>

        <section className={styles.panel}>
          <h2>PDF 생성</h2>
          <div className={styles.section}>
            <label>
              템플릿 선택
              <select value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>
                {templateOptions}
              </select>
            </label>
            <label>
              지원서 파일 업로드 (.hwp/.hwpx)
              <input
                type="file"
                accept=".hwp,.hwpx"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          <button className={styles.primary} type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '생성 중...' : 'PDF 생성'}
          </button>

          <div className={styles.section}>
            <h3>결과</h3>
            {downloadUrl ? (
              <a className={styles.download} href={downloadUrl}>
                result.pdf 다운로드
              </a>
            ) : (
              <p className={styles.muted}>아직 생성된 PDF가 없습니다.</p>
            )}
          </div>

          <div className={styles.section}>
            <h3>로그</h3>
            <pre className={styles.log}>{log || '로그가 아직 없습니다.'}</pre>
          </div>
        </section>
      </main>
    </div>
  );
}
