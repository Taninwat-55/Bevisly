create table if not exists career_compass_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  intake_data jsonb not null,
  ai_output jsonb,
  status text not null default 'intake_complete',
  created_at timestamptz default now()
);

alter table career_compass_sessions enable row level security;

create policy "candidates can manage own sessions"
  on career_compass_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index career_compass_sessions_user_id_idx on career_compass_sessions(user_id);
