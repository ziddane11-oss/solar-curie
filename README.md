# News Insights MVP

글로벌 경제/테크 외신 기반 뉴스 + 관점 해설(시나리오 2개) 서비스.

## 기술 스택

- **프레임워크**: Next.js 14+ (App Router)
- **스타일링**: Tailwind CSS + shadcn/ui
- **DB**: Supabase (Postgres)
- **뉴스 소스**: 외신 RSS (Reuters, Bloomberg, TechCrunch, WSJ, FT)
- **AI 해설**: OpenAI API
- **배포**: Vercel

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 값 입력

# 3. Supabase에 테이블 생성
# supabase/migrations/001_initial.sql 파일을 Supabase SQL Editor에서 실행

# 4. 개발 서버 실행
npm run dev
```

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial.sql` 실행
3. Settings > API에서 URL과 Service Role Key 복사
4. `.env.local`에 입력

## 크론 설정 (RSS 수집)

[cron-job.org](https://cron-job.org)에서 아래와 같이 설정:

```bash
# 하루 3회 수집 (08:00, 13:00, 18:00 KST)
curl -X POST https://your-domain.vercel.app/api/admin/ingest \
  -H "x-admin-token: your-admin-token"
```

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/feed` | 발행된 기사 피드 |
| `/article/[id]` | 기사 상세 + 해설 |
| `/admin` | 어드민 대시보드 |
| `/admin/edit/[id]` | 해설 수정 |

## API 엔드포인트

### Public

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/feed?date=YYYY-MM-DD` | 발행된 기사+해설 목록 |
| GET | `/api/article/[id]` | 기사 상세 |
| POST | `/api/subscribe` | 이메일 구독 |
| POST | `/api/feedback` | 피드백 저장 |
| POST | `/api/event` | 이벤트 로깅 |

### Admin (x-admin-token 헤더 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/articles` | 수집된 기사 목록 |
| POST | `/api/admin/ingest` | RSS 수집 트리거 |
| POST | `/api/admin/generate-draft` | AI 초안 생성 |
| PUT | `/api/admin/analysis/[id]` | 초안 수정 |
| POST | `/api/admin/publish/[id]` | 발행 |

## 운영 플로우

1. RSS 자동 수집 (크론, 하루 2~3회)
2. 어드민 접속 → 오늘 다룰 기사 3~5개 선택
3. "초안 생성" 클릭 → AI가 해설 초안 작성
4. 초안 검토/수정 (기사당 2~3분)
5. "발행" → 피드에 노출
