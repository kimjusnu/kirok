-- Short user-facing report key so testers can reopen their report via the
-- landing page's "이전 검사 보기" form without pasting a 32-char access token.
--
-- Format: 8 characters from Crockford-style alphabet (no 0/O/1/I/L) uppercase.
-- Space: 31^8 ≈ 8.5e11 → collision probability negligible at our scale.
-- Uniqueness enforced by partial unique index (allows null during backfill).

alter table public.sessions add column report_key text;
create unique index idx_sessions_report_key
  on public.sessions(report_key)
  where report_key is not null;

-- Backfill existing rows. Collision retry loop; raises if consistently unlucky.
do $$
declare
  s record;
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  new_key text;
  i int;
  attempts int;
begin
  for s in select id from public.sessions where report_key is null loop
    attempts := 0;
    loop
      attempts := attempts + 1;
      new_key := '';
      for i in 1..8 loop
        new_key := new_key || substr(
          chars,
          1 + floor(random() * length(chars))::int,
          1
        );
      end loop;
      begin
        update public.sessions set report_key = new_key where id = s.id;
        exit;
      exception when unique_violation then
        if attempts > 10 then
          raise exception 'report_key backfill: too many collisions for session %', s.id;
        end if;
      end;
    end loop;
  end loop;
end $$;
