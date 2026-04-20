-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Tests catalog
-- ============================================================
create table tests (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  description text,
  total_items int not null,
  estimated_minutes int not null,
  price_krw int not null default 1500,
  anchor_price_krw int not null default 9900,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Items (questions)
-- ============================================================
create table test_items (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references tests(id) on delete cascade,
  order_num int not null,
  item_text_ko text not null,
  item_text_en text not null,
  facet text not null,
  reverse_scored boolean not null default false,
  scale_type text not null default 'likert5' check (scale_type in ('likert5', 'likert7')),
  unique (test_id, order_num)
);
create index idx_test_items_test on test_items(test_id);

-- ============================================================
-- Sessions (anonymous - identified by access_token)
-- ============================================================
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references tests(id),
  access_token text not null unique,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  paid_at timestamptz,
  payment_amount int,
  coupon_code text,
  expires_at timestamptz
);
create index idx_sessions_token on sessions(access_token);
create index idx_sessions_expires on sessions(expires_at) where expires_at is not null;

-- ============================================================
-- Responses
-- ============================================================
create table responses (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  item_id uuid not null references test_items(id),
  score int not null,
  answered_at timestamptz not null default now(),
  unique (session_id, item_id)
);
create index idx_responses_session on responses(session_id);

-- ============================================================
-- Results (scored + AI interpretation)
-- ============================================================
create table results (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null unique references sessions(id) on delete cascade,
  raw_scores jsonb not null,
  percentiles jsonb not null,
  ai_interpretation text,
  citations jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

-- ============================================================
-- Coupons
-- ============================================================
create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'free')),
  discount_value int not null,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_coupons_code on coupons(code) where is_active = true;

-- ============================================================
-- Coupon redemptions (one redemption per session)
-- ============================================================
create table coupon_redemptions (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid not null references coupons(id),
  session_id uuid not null unique references sessions(id),
  redeemed_at timestamptz not null default now()
);
create index idx_coupon_redemptions_coupon on coupon_redemptions(coupon_id);

-- ============================================================
-- Payments (Toss Payments integration)
-- ============================================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id),
  toss_payment_key text unique,
  toss_order_id text unique,
  amount int not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'canceled')),
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_session on payments(session_id);
create index idx_payments_status on payments(status);

-- ============================================================
-- Atomic coupon redemption function
-- ============================================================
create or replace function use_coupon(p_code text, p_session_id uuid)
returns jsonb
language plpgsql
security definer
as $func$
declare
  v_coupon coupons%rowtype;
  v_now timestamptz := now();
begin
  -- Lock coupon row for atomic update
  select * into v_coupon from coupons
  where code = p_code and is_active = true
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_coupon.expires_at is not null and v_coupon.expires_at < v_now then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  -- Record redemption; unique constraint prevents double-use per session
  insert into coupon_redemptions (coupon_id, session_id, redeemed_at)
  values (v_coupon.id, p_session_id, v_now);

  update coupons set used_count = used_count + 1 where id = v_coupon.id;

  return jsonb_build_object(
    'ok', true,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'already_used');
end;
$func$;
