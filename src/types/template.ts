// ─── 매핑 규칙 타입 (Mapping Rule Types) ────────────────────────
export type RuleType = 'find_replace' | 'bookmark' | 'table_row';

// ─── 단일 매핑 규칙 ────────────────────────────────────────────
export interface MappingRule {
  type: RuleType;
  // find_replace: 문서 내 텍스트 치환
  find?: string;                  // 찾을 문자열 (e.g. "<<NAME>>")
  // bookmark: 한글 필드 이름
  field?: string;                 // 필드명 (e.g. "ApplicantName")
  // table_row: 반복 데이터 (경력, 학력)
  table_id?: string;              // 테이블 식별자
  row_template?: string[];        // 컬럼별 value_path 배열
  // 공통
  value_path: string;             // 프로필/자소서 데이터 경로 (e.g. "personal.name")
  fallback?: string;              // 매핑 실패 시 기본값
  transform?: 'date_kr' | 'phone_format' | 'period_calc' | 'none';
}

// ─── 필드 요구사항 (Template가 요구하는 필드 목록) ──────────────
export interface FieldRequirement {
  value_path: string;
  label: string;                  // 사람이 읽을 수 있는 필드명
  required: boolean;
}

// ─── 템플릿 매핑 정의 ──────────────────────────────────────────
export interface TemplateMap {
  template_id: string;
  template_name: string;
  version: number;
  description: string;
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

// ─── 매핑 결과 (엔진 출력) ─────────────────────────────────────
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
