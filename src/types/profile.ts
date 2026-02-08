// ─── 인적사항 (Personal Information) ────────────────────────────
export interface PersonalInfo {
  name: string;                   // 이름 (필수)
  name_hanja: string;             // 한자 이름
  birth: string;                  // 생년월일 YYYY-MM-DD (필수)
  gender: '남' | '여' | '';       // 성별
  phone: string;                  // 연락처 (필수)
  phone_secondary: string;        // 보조 연락처
  email: string;                  // 이메일
  address: string;                // 주소 (필수)
  address_detail: string;         // 상세주소
  postal_code: string;            // 우편번호
}

// ─── 교원자격증 (Teacher Certification) ─────────────────────────
export interface TeacherCertification {
  cert_type: string;              // 자격 종류: 정교사(1급), 정교사(2급), 준교사, 전문상담교사 등
  cert_subject: string;           // 표시 과목 (필수)
  cert_number: string;            // 자격증 번호
  cert_date: string;              // 취득일 YYYY-MM-DD
  issuer: string;                 // 발급 기관
}

// ─── 기타 자격증 (Other Certifications) ─────────────────────────
export interface OtherCertification {
  cert_name: string;              // 자격증명
  cert_number: string;            // 번호
  cert_date: string;              // 취득일
  issuer: string;                 // 발급 기관
}

// ─── 학력 (Education) ───────────────────────────────────────────
export interface Education {
  school: string;                 // 학교명 (필수)
  major: string;                  // 전공 (필수)
  degree: '학사' | '석사' | '박사' | '전문학사' | '';  // 학위
  status: '졸업' | '재학' | '수료' | '중퇴' | '';      // 상태
  start_date: string;             // 입학일 YYYY-MM
  end_date: string;               // 졸업일 YYYY-MM
  thesis_title: string;           // 논문 제목 (석사/박사)
}

// ─── 경력 (Career History) ──────────────────────────────────────
export interface Career {
  institution: string;            // 기관명 (필수)
  position: string;               // 직위: 기간제교사, 강사, 담임 등
  subject: string;                // 담당 교과
  start_date: string;             // 시작일 YYYY-MM-DD
  end_date: string;               // 종료일 YYYY-MM-DD
  is_contract: boolean;           // 기간제 여부
  total_months: number;           // 근무 개월수 (자동 계산 가능)
  notes: string;                  // 비고
}

// ─── 병역 (Military Service) ────────────────────────────────────
export interface Military {
  status: '필' | '미필' | '면제' | '해당없음' | '';
  branch: string;                 // 군별
  rank: string;                   // 계급
  start_date: string;             // 복무 시작
  end_date: string;               // 복무 종료
}

// ─── 기타 (Additional Information) ──────────────────────────────
export interface AdditionalInfo {
  disability: string;             // 장애 여부/등급
  veteran: string;                // 보훈 대상
  multi_cultural: boolean;        // 다문화 가정
  custom_fields: CustomField[];   // 사용자 정의 필드
}

export interface CustomField {
  key: string;
  label: string;
  value: string;
}

// ─── 전체 프로필 (Complete Profile) ─────────────────────────────
export interface Profile {
  version: number;                // 스키마 버전
  personal: PersonalInfo;
  teacher_cert: TeacherCertification[];
  other_certs: OtherCertification[];
  education: Education[];
  career: Career[];
  military: Military;
  additional: AdditionalInfo;
}

// ─── 빈 기본값 팩토리 ──────────────────────────────────────────
export const emptyPersonalInfo: PersonalInfo = {
  name: '', name_hanja: '', birth: '', gender: '',
  phone: '', phone_secondary: '', email: '',
  address: '', address_detail: '', postal_code: '',
};

export const emptyTeacherCert: TeacherCertification = {
  cert_type: '', cert_subject: '', cert_number: '',
  cert_date: '', issuer: '',
};

export const emptyOtherCert: OtherCertification = {
  cert_name: '', cert_number: '', cert_date: '', issuer: '',
};

export const emptyEducation: Education = {
  school: '', major: '', degree: '', status: '',
  start_date: '', end_date: '', thesis_title: '',
};

export const emptyCareer: Career = {
  institution: '', position: '', subject: '',
  start_date: '', end_date: '', is_contract: true,
  total_months: 0, notes: '',
};

export const emptyMilitary: Military = {
  status: '', branch: '', rank: '', start_date: '', end_date: '',
};

export const emptyAdditional: AdditionalInfo = {
  disability: '', veteran: '', multi_cultural: false, custom_fields: [],
};

export const emptyProfile: Profile = {
  version: 2,
  personal: emptyPersonalInfo,
  teacher_cert: [{ ...emptyTeacherCert }],
  other_certs: [],
  education: [{ ...emptyEducation }],
  career: [{ ...emptyCareer }],
  military: { ...emptyMilitary },
  additional: { ...emptyAdditional },
};
