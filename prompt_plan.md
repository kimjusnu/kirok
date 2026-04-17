# 기질검사 모노레포 - 구현 계획

> 확정일: 2026-04-17
> 1차 배포 범위: **MVP (Big Five/IPIP-NEO-120 1개)**

---

## 프로젝트 개요

논문 기반 정밀 기질검사 웹사이트. 익명 1회성 결제(1,200원) + 쿠폰(100% 무료) 구조.
AI가 결과를 해석하고 관련 논문을 자동 인용. 인프라 전부 무료 티어 운영.

## 확정 사항

| 항목 | 결정 |
|---|---|
| 앵커 가격 | 9,900원 → **1,200원** (88% 할인) |
| 쿠폰 100% 할인 | **PG 우회** (결제 수수료 절약) |
| 리포트 유효기간 | **7일** |
| 사업자등록 | 있음 → 토스페이먼츠 게스트 결제 사용 |
| 1차 배포 범위 | **MVP (Big Five 1개)** |

## 기술 스택

### 모노레포
- **Turborepo** + **pnpm workspaces**

```
apps/
  web/              # Next.js 14 App Router (고객)
  admin/            # Next.js (관리자 - 쿠폰 발급)
packages/
  tests/            # 검사 문항 seed 데이터
  scoring/          # 채점 엔진 (리커트 + 백분위)
  ai/               # Gemini + Semantic Scholar 래퍼
  db/               # Supabase 클라이언트 + 타입
  ui/               # shadcn/ui 공통 컴포넌트
  shared/           # zod 스키마, 유틸
```

### 인프라 (전부 무료 티어)
| 역할 | 서비스 | 한도 |
|---|---|---|
| 호스팅 | Vercel Hobby | 100GB 대역폭/월 |
| DB+Auth | Supabase Free | 500MB DB, 50K MAU |
| AI | Gemini 1.5 Flash | 1,500 req/일 |
| 논문 검색 | Semantic Scholar | API 키 불필요 |
| 결제 | 토스페이먼츠 | 3.3% 수수료 |
| 모니터링 | Sentry Free | 5K 이벤트/월 |

### 프론트엔드
- Next.js 14 App Router + TypeScript
- TailwindCSS + shadcn/ui
- Framer Motion (검사 전환 UX)
- Zustand (검사 진행 상태)
- React Hook Form + Zod

## 검사 카탈로그

### 1차 MVP
| 검사 | 문항 | 시간 | 측정 | 가격 |
|---|---|---|---|---|
| **IPIP-NEO-120** | 120 | 20분 | Big Five 5요인 + 30면모 | 1,200원 |
| TIPI (맛보기) | 10 | 2분 | 간이 Big Five | 무료 |

### 2차 확장 (MVP 이후)
- HEXACO-PI-R (100문항) - 6요인
- TEMPS-A (110문항) - 기질 4유형
- ECR-R (36문항) - 애착유형
- SD3 (27문항) - 다크 트라이어드
- SSEIT (33문항) - 정서지능

## DB 스키마 (Supabase)

```sql
-- 검사 메타데이터
tests (
  id uuid PK,
  slug text UNIQUE,
  name_ko text, name_en text,
  description text,
  total_items int,
  estimated_minutes int,
  price_krw int DEFAULT 1200,
  anchor_price_krw int DEFAULT 9900,
  is_active bool,
  created_at timestamptz
)

-- 문항
test_items (
  id uuid PK,
  test_id uuid FK,
  order_num int,
  item_text_ko text, item_text_en text,
  facet text,             -- 측정 요인 (e.g. 'openness.imagination')
  reverse_scored bool,
  scale_type text         -- 'likert5' | 'likert7'
)

-- 세션 (익명)
sessions (
  id uuid PK,
  test_id uuid FK,
  access_token text UNIQUE,   -- 리포트 접근 토큰
  started_at timestamptz,
  completed_at timestamptz,
  paid_at timestamptz,
  payment_amount int,
  coupon_code text,
  expires_at timestamptz      -- paid_at + 7일
)

-- 응답
responses (
  id uuid PK,
  session_id uuid FK,
  item_id uuid FK,
  score int,
  answered_at timestamptz
)

-- 결과
results (
  id uuid PK,
  session_id uuid FK,
  raw_scores jsonb,           -- {openness: 4.2, ...}
  percentiles jsonb,          -- {openness: 78, ...}
  ai_interpretation text,
  citations jsonb,            -- [{doi, authors, year, title, relevance}]
  generated_at timestamptz
)

-- 쿠폰
coupons (
  id uuid PK,
  code text UNIQUE,
  discount_type text,         -- 'percent' | 'fixed' | 'free'
  discount_value int,
  max_uses int,               -- null = 무제한
  used_count int DEFAULT 0,
  expires_at timestamptz,
  note text,
  created_at timestamptz
)

coupon_redemptions (
  id uuid PK,
  coupon_id uuid FK,
  session_id uuid FK,
  redeemed_at timestamptz
)

-- 결제
payments (
  id uuid PK,
  session_id uuid FK,
  toss_payment_key text,
  amount int,
  status text,                -- 'pending' | 'completed' | 'failed' | 'canceled'
  created_at timestamptz
)
```

### RLS 정책
- `sessions`, `responses`, `results`: access_token 기반 조회만 허용
- `coupons`: 검증 API만 접근 (직접 SELECT 차단)
- `payments`: 관리자 서비스 롤만

## 구현 Phase (MVP 기준)

### Phase 1: 모노레포 부트스트랩 (2-3h)
- [ ] pnpm + Turborepo 초기화
- [ ] 패키지 구조 생성 (web, admin, tests, scoring, ai, db, ui, shared)
- [ ] shadcn/ui 셋업 (packages/ui)
- [ ] 공통 tsconfig/eslint/prettier
- [ ] Git 초기화 + .gitignore

### Phase 2: Supabase DB (2-3h)
- [ ] Supabase 프로젝트 생성
- [ ] 마이그레이션 SQL 작성 및 적용
- [ ] RLS 정책
- [ ] Supabase CLI로 타입 생성 → packages/db
- [ ] 환경변수 (.env.local, .env.example)

### Phase 3: 검사 엔진 (4-5h)
- [ ] packages/tests: IPIP-NEO-120 문항 seed (한/영)
- [ ] packages/scoring: 리커트 채점 + 역문항 처리
- [ ] 백분위 계산 (IPIP 공개 규준 데이터 기반)
- [ ] 진행 중 저장 (localStorage + DB 동기화)
- [ ] 이어하기 토큰

### Phase 4: 결제 + 쿠폰 (3-4h)
- [ ] 토스페이먼츠 SDK 연동
- [ ] /api/coupons/validate - 쿠폰 검증
- [ ] /api/payments/confirm - 결제 확인 웹훅
- [ ] 100% 쿠폰 플로우: PG 우회 → 즉시 access_token 발급
- [ ] 쿠폰 사용 횟수 동시성 처리 (Postgres transaction)

### Phase 5: AI 해석 + 논문 인용 (3-4h)
- [ ] packages/ai: Gemini 1.5 Flash 래퍼
- [ ] 프롬프트: 점수 → 한국어 상세 해석
- [ ] Semantic Scholar API 클라이언트
- [ ] 검사 요인별 관련 논문 3-5건 자동 검색
- [ ] 인용 형식 [저자, 연도] 자동 삽입
- [ ] results 테이블 캐싱

### Phase 6: UI/UX (5-6h)
- [ ] 랜딩 페이지: 앵커가격 + 개발자 스토리 + 가격 비교
- [ ] 검사 진행 화면: 1문항/페이지, 진행바, Framer Motion
- [ ] 결제 페이지: 쿠폰 입력, 최종 가격 표시
- [ ] 리포트 페이지: 점수 차트(레이더/막대) + AI 해석 + 논문 링크
- [ ] 모바일 최적화
- [ ] 접근성 (키보드 네비게이션, aria-label)

### Phase 9: 마케팅 랜딩 (2h)
- [ ] "개발자가 만들었습니다" 스토리 섹션
- [ ] 가격 비교 (MBTI 12,000원 vs 우리 1,200원)
- [ ] 논문 근거 섹션 (Big Five 학술 배경)
- [ ] SEO 메타데이터 (Open Graph, JSON-LD)

### Phase 10: 런칭 체크 (1-2h)
- [ ] 개인정보처리방침 (결제정보는 토스에만)
- [ ] 이용약관
- [ ] Google Analytics 또는 Plausible
- [ ] Sentry 연결
- [ ] Vercel 배포

**MVP 예상: 약 22-29시간**

## 2차 확장 Phase (MVP 이후)

### Phase 7: 추가 검사 6종
### Phase 8: 관리자 앱 (쿠폰 발급 UI + 통계 대시보드)

## 리스크 관리

| 등급 | 리스크 | 완화 전략 |
|---|---|---|
| 🔴 HIGH | Gemini 무료 1,500 req/일 한도 | 결과 캐싱, 동일 점수 패턴 재사용, 결제 완료 시에만 호출 |
| 🟡 MED | 익명 토큰 분실 시 복구 불가 | 결제 완료 페이지에 북마크 유도 + QR코드 + 링크 복사 버튼 |
| 🟡 MED | 문항 저작권 재확인 필요 | IPIP (Goldberg, 공개), HEXACO (Lee & Ashton, 연구용 공개) 라이선스 문서 검증 |
| 🟡 MED | Semantic Scholar 레이트 리밋 | 검사 요인별 추천 논문 사전 큐레이션 + 런타임 동적 보강 |
| 🟢 LOW | Supabase 500MB DB 한도 | 오래된 미결제 세션 정리 크론 |
| 🟢 LOW | Vercel 100GB 대역폭 한도 | 이미지 최적화, 정적 생성 최대화 |

## 다음 단계

Phase 1부터 순차 진행. 각 Phase 완료 시 테스트 + 검증 후 다음 단계로.

구현 진행 커맨드:
- `/tdd` - 테스트 우선 구현 (권장)
- `/auto` - 한 번에 자동 실행
- 또는 Phase별 수동 진행

---

## 이전 계획

_(첫 계획이므로 이전 기록 없음)_
