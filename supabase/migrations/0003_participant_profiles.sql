-- ============================================================
-- Participant profiles (opt-in demographics)
-- One-to-one with sessions. Nickname (display name), gender, age range.
-- No real name / email / phone stored. Consent recorded at row creation.
-- ============================================================
create table participant_profiles (
  session_id uuid primary key references sessions(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  gender text not null check (gender in ('male', 'female', 'other', 'prefer_not')),
  age_range text not null check (age_range in ('teens', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_participant_profiles_created on participant_profiles(created_at desc);

alter table participant_profiles enable row level security;
-- No anon policies; service role only (admin + API server).
