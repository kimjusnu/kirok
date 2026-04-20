-- Public coupon flag: 결제 페이지 드롭다운에 "빠른 적용" 옵션으로 노출할지
-- 여부를 관리자가 쿠폰별로 제어.
--
-- 기본값 false → 지금까지 만들어 둔 개인용/비공개 코드는 그대로 숨김 상태.
-- 공개 쿠폰은 /api/coupons/public 로 익명 유저에게 노출.

alter table public.coupons
  add column is_public boolean not null default false;

-- 결제창에서 기본 노출 중이던 "런칭 할인 쿠폰"은 is_public=true로 고정.
update public.coupons set is_public = true where code = 'LAUNCH1500';

-- 그 외 프로덕션에 이미 존재하는 비공개 쿠폰(예: 이전 시드로 생성된 100%
-- 무료 수동 공유 코드)은 default false를 그대로 유지. 관리자 UI에서
-- 필요 시 "공개" 토글로 개별 제어.
