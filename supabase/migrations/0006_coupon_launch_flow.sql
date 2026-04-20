-- Pricing + launch coupon flow:
--   Base price (price_krw):        1,500 → 4,900원  (쇼윈도 기준가)
--   Anchor  (anchor_price_krw):    4,900 → 9,900원  (원가 의식)
-- Payment screen now shows 4,900원 by default. The preset launch coupon
-- below brings it down to 1,500원. Private 100%-off coupons should be
-- created via admin UI with a randomized code — never seeded here, since
-- this file lives in a public git repo.

update public.tests
set
  price_krw = 4900,
  anchor_price_krw = 9900
where slug = 'ipip50';

alter table public.tests alter column price_krw set default 4900;
alter table public.tests alter column anchor_price_krw set default 9900;

-- Launch coupon: fixed 3,400원 off → 4,900 - 3,400 = 1,500원.
-- Exposed as the first dropdown option on the checkout page.
insert into public.coupons (code, discount_type, discount_value, max_uses, note, is_active)
values ('LAUNCH1500', 'fixed', 3400, null, '런칭 할인 쿠폰 (결제창 드롭다운 기본)', true)
on conflict (code) do update
  set discount_type = excluded.discount_type,
      discount_value = excluded.discount_value,
      max_uses = excluded.max_uses,
      note = excluded.note,
      is_active = true;
