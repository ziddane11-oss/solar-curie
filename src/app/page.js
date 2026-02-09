'use client';

import { useEffect, useState, useCallback } from 'react';
import TabNav from '@/components/ui/TabNav';
import ProfileBar from '@/components/ui/ProfileBar';
import PrivacyNotice from '@/components/ui/PrivacyNotice';
import PersonalInfoForm from '@/components/forms/PersonalInfoForm';
import EducationForm from '@/components/forms/EducationForm';
import CareerForm from '@/components/forms/CareerForm';
import MilitaryForm from '@/components/forms/MilitaryForm';
import AdditionalForm from '@/components/forms/AdditionalForm';
import TeacherPackForm from '@/components/forms/TeacherPackForm';
import CoverLetterForm from '@/components/forms/CoverLetterForm';
import GeneratePanel from '@/components/forms/GeneratePanel';
import { emptyProfile } from '@/types/profile';
import { emptyCoverLetter } from '@/types/cover-letter';
import {
  loadActiveProfile,
  saveProfile,
  createProfile,
  renameProfile,
  duplicateProfile,
  deleteProfile,
  getAllProfiles,
  setActiveProfileId,
  loadCoverLetter,
  saveCoverLetter,
  loadStampSettings,
  saveStampSettings,
  resetAllData,
  debouncedSave,
} from '@/lib/storage';
import { exportProfileJSON, importProfileJSON, openFilePicker } from '@/lib/io';
import { useAuth, isFeatureEnabled } from '@/lib/auth';
import styles from './page.module.css';

const TABS = [
  { id: 'basic', label: '기본정보' },
  { id: 'teacher', label: '교사용 확장팩' },
  { id: 'cover_letter', label: '자기소개서' },
  { id: 'output', label: '출력·템플릿' },
];

export default function Home() {
  const [profile, setProfile] = useState(emptyProfile);
  const [coverLetter, setCoverLetter] = useState(emptyCoverLetter);
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [status, setStatus] = useState('');
  const [log, setLog] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stampSettings, setStampSettings] = useState({ enabled: false, name: '', size: 'M' });
  const [loaded, setLoaded] = useState(false);

  const auth = useAuth();

  // Load from LocalStorage on mount
  useEffect(() => {
    const entry = loadActiveProfile(emptyProfile);
    setProfile(entry.profile);
    setActiveId(entry.id);
    setProfiles(getAllProfiles());
    setCoverLetter(loadCoverLetter(emptyCoverLetter));
    setStampSettings(loadStampSettings());
    setLoaded(true);

    // Load templates from API
    fetch('/api/templates')
      .then((r) => r.ok ? r.json() : { templates: [] })
      .then((d) => setTemplates(d.templates || []))
      .catch(() => {});
  }, []);

  // Auto-save profile on change (debounced)
  useEffect(() => {
    if (!loaded || !activeId) return;
    debouncedSave(() => {
      saveProfile(activeId, profile);
      setProfiles(getAllProfiles());
      setStatus('자동 저장됨');
    }, 500);
  }, [profile, loaded, activeId]);

  // Auto-save cover letter on change (debounced)
  useEffect(() => {
    if (!loaded) return;
    debouncedSave(() => {
      saveCoverLetter(coverLetter);
    }, 500);
  }, [coverLetter, loaded]);

  const updateProfile = useCallback((key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── Profile management handlers ────────────────────────────
  const handleSwitchProfile = (id) => {
    // Save current first
    if (activeId) saveProfile(activeId, profile);
    saveCoverLetter(coverLetter);

    setActiveProfileId(id);
    setActiveId(id);
    const allProfiles = getAllProfiles();
    const entry = allProfiles.find((p) => p.id === id);
    if (entry) setProfile(entry.profile);
    setProfiles(allProfiles);
  };

  const handleSaveAs = () => {
    const name = prompt('새 프로필 이름:');
    if (!name) return;
    const entry = createProfile(name, profile);
    setActiveId(entry.id);
    setProfiles(getAllProfiles());
    setStatus(`"${name}" 저장됨`);
  };

  const handleRename = () => {
    const current = profiles.find((p) => p.id === activeId);
    const name = prompt('새 이름:', current?.name || '');
    if (!name) return;
    renameProfile(activeId, name);
    setProfiles(getAllProfiles());
  };

  const handleDuplicate = () => {
    const entry = duplicateProfile(activeId);
    if (entry) {
      setActiveId(entry.id);
      setProfile(entry.profile);
      setProfiles(getAllProfiles());
      setStatus('프로필 복제됨');
    }
  };

  const handleDelete = () => {
    if (!confirm('정말 이 프로필을 삭제하시겠습니까?')) return;
    const remaining = deleteProfile(activeId);
    setProfiles(remaining);
    if (remaining.length > 0) {
      const entry = loadActiveProfile(emptyProfile);
      setActiveId(entry.id);
      setProfile(entry.profile);
    }
  };

  const handleExport = () => {
    exportProfileJSON(profile, coverLetter);
    setStatus('내보내기 완료');
  };

  const handleImport = async () => {
    const file = await openFilePicker();
    if (!file) return;
    try {
      const result = await importProfileJSON(file);
      setProfile(result.profile);
      if (result.coverLetter) setCoverLetter(result.coverLetter);
      if (activeId) saveProfile(activeId, result.profile);
      if (result.coverLetter) saveCoverLetter(result.coverLetter);
      setProfiles(getAllProfiles());
      setStatus('가져오기 완료');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = () => {
    resetAllData();
    setProfile(emptyProfile);
    setCoverLetter(emptyCoverLetter);
    const entry = loadActiveProfile(emptyProfile);
    setActiveId(entry.id);
    setProfiles(getAllProfiles());
    setStatus('초기화 완료');
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

    try {
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
    } catch {
      setIsGenerating(false);
      setStatus('PDF 생성 실패 (네트워크 오류)');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <>
            <PersonalInfoForm data={profile.personal} onChange={(v) => updateProfile('personal', v)} />
            <div style={{ height: 24 }} />
            <EducationForm items={profile.education} onChange={(v) => updateProfile('education', v)} />
            <div style={{ height: 24 }} />
            <CareerForm items={profile.career} onChange={(v) => updateProfile('career', v)} />
            <div style={{ height: 24 }} />
            <MilitaryForm data={profile.military} onChange={(v) => updateProfile('military', v)} />
            <div style={{ height: 24 }} />
            <AdditionalForm
              data={{ disability: '', veteran: '', multi_cultural: false, custom_fields: profile.custom_fields || [] }}
              onChange={(v) => updateProfile('custom_fields', v.custom_fields || [])}
            />
          </>
        );
      case 'teacher':
        return (
          <TeacherPackForm
            teacherPack={profile.teacher_pack}
            onChange={(v) => updateProfile('teacher_pack', v)}
          />
        );
      case 'cover_letter':
        return (
          <CoverLetterForm
            sections={coverLetter.sections}
            onChange={(sections) => setCoverLetter((prev) => ({ ...prev, sections }))}
          />
        );
      case 'output':
        return (
          <GeneratePanel
            templates={templates}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            status={status}
            downloadUrl={downloadUrl}
            log={log}
            profile={profile}
            coverLetter={coverLetter}
            stampSettings={stampSettings}
            onStampChange={(s) => { setStampSettings(s); saveStampSettings(s); }}
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
          <h1>지원서작성기</h1>
          <p>프로필 입력 → 자기소개서 작성 → PDF 자동 생성</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.status}>{status}</span>
          {isFeatureEnabled('cloud_sync') && (
            <button type="button" className={styles.saveBtn} disabled>
              {auth.isLoggedIn ? '클라우드 동기화' : 'Sign in'}
            </button>
          )}
        </div>
      </header>

      <div className={styles.container}>
        <ProfileBar
          profiles={profiles}
          activeId={activeId}
          onSwitch={handleSwitchProfile}
          onSaveAs={handleSaveAs}
          onRename={handleRename}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onExport={handleExport}
          onImport={handleImport}
        />
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={styles.main}>
          {renderTab()}
        </main>
        <PrivacyNotice onReset={handleReset} />
      </div>
    </div>
  );
}
