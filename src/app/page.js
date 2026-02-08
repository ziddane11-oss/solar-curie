'use client';

import { useEffect, useState } from 'react';
import TabNav from '@/components/ui/TabNav';
import PersonalInfoForm from '@/components/forms/PersonalInfoForm';
import CertificationForm from '@/components/forms/CertificationForm';
import EducationForm from '@/components/forms/EducationForm';
import CareerForm from '@/components/forms/CareerForm';
import MilitaryForm from '@/components/forms/MilitaryForm';
import AdditionalForm from '@/components/forms/AdditionalForm';
import CoverLetterForm from '@/components/forms/CoverLetterForm';
import GeneratePanel from '@/components/forms/GeneratePanel';
import styles from './page.module.css';

const EMPTY_PROFILE = {
  version: 2,
  personal: {
    name: '', name_hanja: '', birth: '', gender: '',
    phone: '', phone_secondary: '', email: '',
    address: '', address_detail: '', postal_code: '',
  },
  teacher_cert: [{ cert_type: '', cert_subject: '', cert_number: '', cert_date: '', issuer: '' }],
  other_certs: [],
  education: [{ school: '', major: '', degree: '', status: '', start_date: '', end_date: '', thesis_title: '' }],
  career: [{ institution: '', position: '', subject: '', start_date: '', end_date: '', is_contract: true, total_months: 0, notes: '' }],
  military: { status: '', branch: '', rank: '', start_date: '', end_date: '' },
  additional: { disability: '', veteran: '', multi_cultural: false, custom_fields: [] },
};

const EMPTY_COVER_LETTER = {
  version: 1,
  sections: [
    { id: 'self_intro', title: '자기소개', body: '', max_length: 1000 },
    { id: 'motivation', title: '지원동기', body: '', max_length: 1000 },
    { id: 'philosophy', title: '교육관', body: '', max_length: 1000 },
    { id: 'future_plan', title: '향후 계획', body: '', max_length: 500 },
  ],
};

const TABS = [
  { id: 'personal', label: '인적사항' },
  { id: 'certs', label: '자격증' },
  { id: 'education', label: '학력' },
  { id: 'career', label: '경력' },
  { id: 'military', label: '병역/기타' },
  { id: 'cover_letter', label: '자기소개서' },
  { id: 'generate', label: 'PDF 생성' },
];

export default function Home() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [coverLetter, setCoverLetter] = useState(EMPTY_COVER_LETTER);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [status, setStatus] = useState('');
  const [log, setLog] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [profileRes, coverLetterRes, templatesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/cover-letter'),
        fetch('/api/templates'),
      ]);

      if (profileRes.ok) {
        const d = await profileRes.json();
        if (d.profile?.version === 2) setProfile(d.profile);
      }
      if (coverLetterRes.ok) {
        const d = await coverLetterRes.json();
        if (d.coverLetter) setCoverLetter(d.coverLetter);
      }
      if (templatesRes.ok) {
        const d = await templatesRes.json();
        setTemplates(d.templates || []);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('저장 중...');

    const [profileRes, coverLetterRes] = await Promise.all([
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      }),
      fetch('/api/cover-letter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter }),
      }),
    ]);

    setIsSaving(false);
    setStatus(profileRes.ok && coverLetterRes.ok ? '저장 완료' : '저장 실패');
  };

  const handleGenerate = async ({ templateId, file }) => {
    if (!file) { setStatus('파일을 선택해 주세요.'); return; }
    if (!templateId) { setStatus('템플릿을 선택해 주세요.'); return; }

    setIsGenerating(true);
    setStatus('PDF 생성 중...');
    setDownloadUrl('');
    setLog('');

    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('file', file);

    const res = await fetch('/api/generate', { method: 'POST', body: formData });
    const data = await res.json();
    setIsGenerating(false);

    if (res.ok && data.success) {
      setStatus('PDF 생성 완료');
      setDownloadUrl(data.downloadUrl);
      setLog(data.log || '');
    } else {
      setStatus('PDF 생성 실패');
      setLog(data.log || data.error || '');
    }
  };

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoForm data={profile.personal} onChange={(v) => updateProfile('personal', v)} />;
      case 'certs':
        return (
          <CertificationForm
            teacherCerts={profile.teacher_cert}
            otherCerts={profile.other_certs}
            onChangeTeacher={(v) => updateProfile('teacher_cert', v)}
            onChangeOther={(v) => updateProfile('other_certs', v)}
          />
        );
      case 'education':
        return <EducationForm items={profile.education} onChange={(v) => updateProfile('education', v)} />;
      case 'career':
        return <CareerForm items={profile.career} onChange={(v) => updateProfile('career', v)} />;
      case 'military':
        return (
          <>
            <MilitaryForm data={profile.military} onChange={(v) => updateProfile('military', v)} />
            <AdditionalForm data={profile.additional} onChange={(v) => updateProfile('additional', v)} />
          </>
        );
      case 'cover_letter':
        return (
          <CoverLetterForm
            sections={coverLetter.sections}
            onChange={(sections) => setCoverLetter((prev) => ({ ...prev, sections }))}
          />
        );
      case 'generate':
        return (
          <GeneratePanel
            templates={templates}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            status={status}
            downloadUrl={downloadUrl}
            log={log}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>기간제 교사 지원서 자동 생성기</h1>
          <p>프로필 입력 → 템플릿 선택 → PDF 자동 생성</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.status}>{status}</span>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '전체 저장'}
          </button>
        </div>
      </header>

      <div className={styles.container}>
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={styles.main}>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
