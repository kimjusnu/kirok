-- Update pricing: 초기 운영 가격 1,500 → 1,900원, 원가 9,900 → 4,900원.
-- Anchor (원가) falls back from Gemini call cost recovery assumptions.

update public.tests
set
  price_krw = 1900,
  anchor_price_krw = 4900
where slug = 'ipip50';

-- Adjust default for any future inserts (optional — seed-tests.ts already passes explicit values).
alter table public.tests alter column price_krw set default 1900;
alter table public.tests alter column anchor_price_krw set default 4900;
