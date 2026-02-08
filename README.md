# 기간제 교사 지원서 자동 생성기

Windows 10/11 로컬 환경에서 한글(HWP/HWPX) 지원서를 자동으로 채우고 PDF로 내보내는 도구입니다.

## 주요 기능

- HWP/HWPX 지원서 업로드
- 저장된 `data/profile.json` + `data/year.json` 기반 자동 채움
- 문서별 매핑(`templates/<template_id>/map.json`)으로 안정적인 치환
- 한컴오피스(한글) COM 자동화로 PDF 내보내기
- Next.js UI에서 업로드 → 생성 → 다운로드까지 원클릭

## 폴더 구조

```
/
  src/
    app/
      page.tsx
      api/
        generate/route.ts
        profile/route.ts
        templates/route.ts
  scripts/
    hwp_fill_and_export.py
  data/
    profile.json
    year.json
  templates/
    <template_id>/
      map.json
      sample.hwp|sample.hwpx (선택)
  output/
    <job_id>/
      filled.hwp|filled.hwpx
      result.pdf
      log.txt
```

## 사전 준비

- Windows 10/11
- 한컴오피스(한글) 설치
- Python + pywin32 설치

```bash
pip install pywin32
```

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속합니다.

## 사용 흐름

1. 좌측에서 프로필 정보를 입력 후 **프로필 저장**
2. 우측에서 템플릿 선택 및 HWP/HWPX 파일 업로드
3. **PDF 생성** 버튼 클릭
4. 결과 다운로드 링크 클릭

## map.json 규격 예시

```json
{
  "template_id": "haesung_2026",
  "template_name": "해성고 2026 지원서",
  "rules": [
    { "type": "find_replace", "find": "<<NAME>>", "value_path": "person.name" },
    { "type": "bookmark", "field": "ApplicantName", "value_path": "person.name" }
  ]
}
```

## 참고 사항

- 자동 필드 추론이 아닌 문서별 매핑 방식으로 안정성을 확보합니다.
- `output/<job_id>/log.txt`에 자동화 로그가 기록됩니다.
- 한글이 응답하지 않을 경우 API에서 타임아웃을 적용합니다.
