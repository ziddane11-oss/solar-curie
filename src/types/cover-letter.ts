import { z } from 'zod';

// ─── 자기소개서 항목 ────────────────────────────────────────────
export const CoverLetterSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().default(''),
  max_length: z.number().default(0),
});
export type CoverLetterSection = z.infer<typeof CoverLetterSectionSchema>;

// ─── 전체 자기소개서 ────────────────────────────────────────────
export const CoverLetterSchema = z.object({
  version: z.literal(2),
  sections: z.array(CoverLetterSectionSchema),
});
export type CoverLetter = z.infer<typeof CoverLetterSchema>;

// ─── 기본 섹션 프리셋 (v2 – 6개 항목) ──────────────────────────
export const defaultSections: CoverLetterSection[] = [
  { id: 'growth',       title: '성장과정',         body: '', max_length: 1000 },
  { id: 'personality',  title: '성격의 장단점',     body: '', max_length: 1000 },
  { id: 'motivation',   title: '지원동기',          body: '', max_length: 1000 },
  { id: 'philosophy',   title: '교육관',            body: '', max_length: 1000 },
  { id: 'future_plan',  title: '향후 계획',         body: '', max_length: 500 },
  { id: 'freeform',     title: '자유 서술',         body: '', max_length: 2000 },
];

export const emptyCoverLetter: CoverLetter = {
  version: 2,
  sections: defaultSections.map((s) => ({ ...s })),
};
