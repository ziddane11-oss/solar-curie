import { z } from 'zod';

// ─── 인적사항 (Personal Information) ────────────────────────────
export const PersonalInfoSchema = z.object({
  name: z.string().default(''),
  name_hanja: z.string().default(''),
  birth: z.string().default(''),
  gender: z.enum(['남', '여', '']).default(''),
  phone: z.string().default(''),
  phone_secondary: z.string().default(''),
  email: z.string().default(''),
  address: z.string().default(''),
  address_detail: z.string().default(''),
  postal_code: z.string().default(''),
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// ─── 학력 (Education) ───────────────────────────────────────────
export const EducationSchema = z.object({
  school: z.string().default(''),
  major: z.string().default(''),
  degree: z.enum(['학사', '석사', '박사', '전문학사', '']).default(''),
  status: z.enum(['졸업', '재학', '수료', '중퇴', '']).default(''),
  start_date: z.string().default(''),
  end_date: z.string().default(''),
  thesis_title: z.string().default(''),
});
export type Education = z.infer<typeof EducationSchema>;

// ─── 경력 (Career History) ──────────────────────────────────────
export const CareerSchema = z.object({
  institution: z.string().default(''),
  position: z.string().default(''),
  subject: z.string().default(''),
  start_date: z.string().default(''),
  end_date: z.string().default(''),
  is_contract: z.boolean().default(true),
  total_months: z.number().default(0),
  notes: z.string().default(''),
});
export type Career = z.infer<typeof CareerSchema>;

// ─── 병역 (Military Service) ────────────────────────────────────
export const MilitarySchema = z.object({
  status: z.enum(['필', '미필', '면제', '해당없음', '']).default(''),
  branch: z.string().default(''),
  rank: z.string().default(''),
  start_date: z.string().default(''),
  end_date: z.string().default(''),
});
export type Military = z.infer<typeof MilitarySchema>;

// ─── 기타 자격증 (Other Certifications) ─────────────────────────
export const OtherCertSchema = z.object({
  cert_name: z.string().default(''),
  cert_number: z.string().default(''),
  cert_date: z.string().default(''),
  issuer: z.string().default(''),
});
export type OtherCert = z.infer<typeof OtherCertSchema>;

// ─── 사용자 정의 필드 ───────────────────────────────────────────
export const CustomFieldSchema = z.object({
  key: z.string().default(''),
  label: z.string().default(''),
  value: z.string().default(''),
});
export type CustomField = z.infer<typeof CustomFieldSchema>;

// ─── 교원자격증 (Teacher Certification) ─────────────────────────
export const TeacherCertSchema = z.object({
  cert_type: z.string().default(''),
  cert_subject: z.string().default(''),
  cert_number: z.string().default(''),
  cert_date: z.string().default(''),
  issuer: z.string().default(''),
});
export type TeacherCert = z.infer<typeof TeacherCertSchema>;

// ─── NICE 인력풀 ────────────────────────────────────────────────
export const NicePoolSchema = z.object({
  registered: z.boolean().default(false),
  pool_region: z.string().default(''),
  pool_subject: z.string().default(''),
  pool_year: z.string().default(''),
});
export type NicePool = z.infer<typeof NicePoolSchema>;

// ─── 학교 지원 대상 ────────────────────────────────────────────
export const SchoolTargetSchema = z.object({
  school_name: z.string().default(''),
  department: z.string().default(''),
  tasks: z.string().default(''),
  contract_reason: z.string().default(''),
  contract_start: z.string().default(''),
  contract_end: z.string().default(''),
});
export type SchoolTarget = z.infer<typeof SchoolTargetSchema>;

// ─── TeacherPack (교사용 확장) ──────────────────────────────────
export const TeacherPackSchema = z.object({
  teacher_cert: z.array(TeacherCertSchema).default([]),
  other_certs: z.array(OtherCertSchema).default([]),
  nice_pool: NicePoolSchema.default(() => ({ registered: false, pool_region: '', pool_subject: '', pool_year: '' })),
  school_target: SchoolTargetSchema.default(() => ({ school_name: '', department: '', tasks: '', contract_reason: '', contract_start: '', contract_end: '' })),
});
export type TeacherPack = z.infer<typeof TeacherPackSchema>;

// ─── UniversalProfile (v3) ──────────────────────────────────────
export const UniversalProfileSchema = z.object({
  version: z.literal(3),
  personal: PersonalInfoSchema.default(() => ({
    name: '', name_hanja: '', birth: '', gender: '' as const,
    phone: '', phone_secondary: '', email: '',
    address: '', address_detail: '', postal_code: '',
  })),
  education: z.array(EducationSchema).default([]),
  career: z.array(CareerSchema).default([]),
  military: MilitarySchema.default(() => ({ status: '' as const, branch: '', rank: '', start_date: '', end_date: '' })),
  other_certs: z.array(OtherCertSchema).default([]),
  custom_fields: z.array(CustomFieldSchema).default([]),
  teacher_pack: TeacherPackSchema.optional(),
});
export type UniversalProfile = z.infer<typeof UniversalProfileSchema>;

// ─── 저장된 프로필 엔트리 (LocalStorage용) ─────────────────────
export const SavedProfileEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  updatedAt: z.string(),
  profile: UniversalProfileSchema,
});
export type SavedProfileEntry = z.infer<typeof SavedProfileEntrySchema>;

// ─── 빈 기본값 ─────────────────────────────────────────────────
export const emptyProfile: UniversalProfile = {
  version: 3,
  personal: {
    name: '', name_hanja: '', birth: '', gender: '',
    phone: '', phone_secondary: '', email: '',
    address: '', address_detail: '', postal_code: '',
  },
  education: [{ school: '', major: '', degree: '', status: '', start_date: '', end_date: '', thesis_title: '' }],
  career: [{ institution: '', position: '', subject: '', start_date: '', end_date: '', is_contract: true, total_months: 0, notes: '' }],
  military: { status: '', branch: '', rank: '', start_date: '', end_date: '' },
  other_certs: [],
  custom_fields: [],
  teacher_pack: {
    teacher_cert: [{ cert_type: '', cert_subject: '', cert_number: '', cert_date: '', issuer: '' }],
    other_certs: [],
    nice_pool: { registered: false, pool_region: '', pool_subject: '', pool_year: '' },
    school_target: { school_name: '', department: '', tasks: '', contract_reason: '', contract_start: '', contract_end: '' },
  },
};
