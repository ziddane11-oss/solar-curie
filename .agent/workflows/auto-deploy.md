---
description: 자동 배포 - Vercel에 자동으로 배포하기
---

// turbo-all

## 자동 배포 워크플로우

1. 변경사항 Git에 추가
```bash
git add -A
```

2. 커밋 생성
```bash
git commit -m "update: 변경사항 반영"
```

3. Vercel 프로덕션 배포
```bash
npx vercel --prod --yes
```

4. 완료 후 프로덕션 URL 확인
