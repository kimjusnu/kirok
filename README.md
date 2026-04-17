# 정밀 기질검사 (Temperament Monorepo)

논문 기반 정확한 기질검사 웹사이트. 익명 1회성 결제(1,200원) + 쿠폰(100% 무료).

## 구조

```
apps/
  web/          Next.js 14 고객용 앱
packages/
  tests/        검사 문항 seed 데이터
  scoring/      채점 엔진
  ai/           Gemini + Semantic Scholar 래퍼
  db/           Supabase 클라이언트 + 타입
  shared/       공통 zod 스키마, 유틸
```

## 개발

```bash
pnpm install
pnpm dev          # 개발 서버
pnpm build        # 빌드
pnpm lint         # 린트
pnpm type-check   # 타입 체크
```

## 계획

구현 계획은 `prompt_plan.md` 참조.
