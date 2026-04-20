-- Generalize payments columns away from Toss-specific naming so we can swap
-- PGs (now Kakao Pay) without schema churn. Kakao Pay's `tid` fits into
-- provider_payment_key; our own order id goes into provider_order_id.
-- Rename preserves existing data; unique constraints move with the column.

alter table public.payments rename column toss_payment_key to provider_payment_key;
alter table public.payments rename column toss_order_id to provider_order_id;

-- Default existing rows to 'toss' (they were recorded via Toss), then drop
-- the default so future inserts must set provider explicitly.
alter table public.payments add column provider text not null default 'toss'
  check (provider in ('toss', 'kakao'));
alter table public.payments alter column provider drop default;
