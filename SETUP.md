# Setup

외부 서비스 계정 + 키 없이는 DB-결제-AI 경로가 동작하지 않습니다. 순서대로 진행해 주세요.

## 1. Supabase (DB + 익명 인증)

### 1-1. 프로젝트 생성
1. https://supabase.com 가입
2. **New project** → Region `Northeast Asia (Seoul)` 권장
3. DB 비밀번호는 별도 저장소에 보관
4. 프로비저닝 약 2분 대기

### 1-2. 환경변수
**Settings → API** 에서 3개 값 복사 후, 프로젝트 루트에 `.env.local` 생성:

```bash
cp .env.example .env.local
# 편집기로 열어서 채움
```

- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠ 비공개)

### 1-3. 마이그레이션 적용

두 가지 중 택일:

**A. Dashboard SQL Editor (간단)**
- SQL Editor 열고 `supabase/migrations/0001_initial.sql` 내용 붙여넣기 → Run
- `supabase/migrations/0002_rls.sql` 도 동일

**B. Supabase CLI (재현성)**
```bash
npm i -g supabase
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

### 1-4. 시드 (IPIP-50 검사 문항 삽입)
```bash
pnpm --filter @temperament/db seed:tests
```

출력 예:
```
→ 성격 5요인 검사 (IPIP-50) (ipip50)
  ✓ tests row: <uuid>
  ✓ test_items upserted: 50

Seed complete.
```

## 2. Google Gemini (AI 해석)
1. https://aistudio.google.com/apikey → **Create API key**
2. `.env.local` 에 `GEMINI_API_KEY=...` 입력
3. 무료 한도: 1,500 req/일 — 결제 완료 세션에만 호출되므로 충분

## 3. 토스페이먼츠 (결제)
1. https://payments.tosspayments.com 가입 (사업자등록 필요)
2. 개발 초기에는 **테스트 키**로 충분:
   - 클라이언트: `test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm`
   - 시크릿: `test_sk_docs_OaPz8L5KdmQXkzRz3y47BMw6`
3. `.env.local`:
   - `NEXT_PUBLIC_TOSS_CLIENT_KEY=...`
   - `TOSS_SECRET_KEY=...`

## 4. 로컬 확인
```bash
pnpm --filter @temperament/web dev
```

브라우저에서:
- `/` — 랜딩
- `/test/ipip50` — 50문항 검사
- 제출 → 결제 페이지 → (테스트 쿠폰 있다면 0원, 아니면 Toss 위젯)
- 완료 → `/report/<token>` — 점수 차트 + AI 해석 + 논문 인용

## 5. 쿠폰 발급 (관리자)
현재 관리자 UI는 2차 확장(Phase 8)이라 Dashboard SQL Editor로 직접 발급:

```sql
insert into coupons (code, discount_type, discount_value, max_uses, note)
values ('LAUNCH', 'free', 0, 100, '런칭 체험단 100명');
```

## 환경변수 요약

| 키 | 용도 | 어디서 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | DB | Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | DB (클라이언트) | Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | DB (서버) | Supabase Settings → API |
| `GEMINI_API_KEY` | AI 해석 | aistudio.google.com/apikey |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 결제 위젯 | 토스페이먼츠 |
| `TOSS_SECRET_KEY` | 결제 확인 | 토스페이먼츠 |
| `NEXT_PUBLIC_SITE_URL` | SEO/OG | 배포 도메인 |
