// ─── 자기소개서 항목 (Cover Letter Section) ────────────────────
export interface CoverLetterSection {
  id: string;                     // 고유 키 (e.g. "self_intro")
  title: string;                  // 항목 제목 (e.g. "자기소개")
  body: string;                   // 본문
  max_length: number;             // 글자 수 제한 (0 = 무제한)
}

// ─── 전체 자기소개서 (Complete Cover Letter) ────────────────────
export interface CoverLetter {
  version: number;
  sections: CoverLetterSection[];
}

// ─── 기본 섹션 프리셋 ──────────────────────────────────────────
export const defaultSections: CoverLetterSection[] = [
  { id: 'self_intro',    title: '자기소개',     body: '', max_length: 1000 },
  { id: 'motivation',    title: '지원동기',     body: '', max_length: 1000 },
  { id: 'philosophy',    title: '교육관',       body: '', max_length: 1000 },
  { id: 'future_plan',   title: '향후 계획',    body: '', max_length: 500 },
];

export const emptyCoverLetter: CoverLetter = {
  version: 1,
  sections: defaultSections.map((s) => ({ ...s })),
};
