// ─── 매핑 규칙 타입 (Mapping Rule Types) ────────────────────────
export type RuleType = 'find_replace' | 'bookmark' | 'table_row';

// ─── 단일 매핑 규칙 ────────────────────────────────────────────
export interface MappingRule {
  type: RuleType;
  find?: string;
  field?: string;
  table_id?: string;
  row_template?: string[];
  value_path: string;
  fallback?: string;
  transform?: 'date_kr' | 'phone_format' | 'period_calc' | 'none';
}

// ─── 필드 요구사항 ──────────────────────────────────────────────
export interface FieldRequirement {
  value_path: string;
  label: string;
  required: boolean;
}

// ─── 템플릿 매핑 정의 ──────────────────────────────────────────
export interface TemplateMap {
  template_id: string;
  template_name: string;
  version: number;
  description: string;
  supported_packs: string[];
  required_fields: FieldRequirement[];
  rules: MappingRule[];
}

// ─── 템플릿 목록 아이템 (API 응답용) ───────────────────────────
export interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  ruleCount: number;
  requiredFieldCount: number;
}

// ─── 매핑 결과 ──────────────────────────────────────────────────
export interface MappingResult {
  rule: MappingRule;
  resolved_value: string;
  status: 'ok' | 'missing' | 'fallback';
}

export interface MappingReport {
  template_id: string;
  total: number;
  resolved: number;
  missing: number;
  results: MappingResult[];
}

// ─── TemplateMapper 인터페이스 ──────────────────────────────────
export interface TemplateMapper {
  id: string;
  name: string;
  supportedPacks: string[];
  map(profile: any, coverLetter: any): Record<string, string>;
  validate(profile: any, coverLetter: any): { field: string; label: string }[];
}
