-- ============================================================
-- Row Level Security
-- Strategy: Client uses anon key for read-only catalog access.
-- All write operations go through Next.js API routes using service_role key.
-- RLS is configured as defense-in-depth; default deny for anon role.
-- ============================================================

alter table tests enable row level security;
alter table test_items enable row level security;
alter table sessions enable row level security;
alter table responses enable row level security;
alter table results enable row level security;
alter table coupons enable row level security;
alter table coupon_redemptions enable row level security;
alter table payments enable row level security;

-- Public catalog: anyone can read active tests
create policy "tests_read_active" on tests
  for select
  using (is_active = true);

-- Public catalog: anyone can read items of active tests
create policy "test_items_read_active" on test_items
  for select
  using (
    exists (
      select 1 from tests
      where tests.id = test_items.test_id and tests.is_active = true
    )
  );

-- All other tables: no anon policies defined -> default deny
-- Service role bypasses RLS automatically
