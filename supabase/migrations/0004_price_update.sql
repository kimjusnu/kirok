-- Pricing update:
--   anchor (정상가): 9,900 → 4,900원
--   sale (할인가):  1,500원 유지 (0001_initial default)
-- The anchor drop aligns marketing with actual Gemini call cost recovery.
-- Homepage copy shows the 1,500 price with a notice that it may revert to 4,900
-- if AI model call costs rise.

update public.tests
set
  price_krw = 1500,
  anchor_price_krw = 4900
where slug = 'ipip50';

alter table public.tests alter column anchor_price_krw set default 4900;
