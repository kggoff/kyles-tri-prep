-- Run this in the Supabase SQL Editor to set up the database schema

-- Activity types table
create table activity_types (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table activity_types enable row level security;
create policy "Users manage own activity types"
  on activity_types for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Training entries table
create table entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key text not null,
  activity_type_id text not null,
  duration int,
  distance real,
  distance_unit text,
  intensity text,
  notes text,
  created_at timestamptz not null default now()
);

alter table entries enable row level security;
create policy "Users manage own entries"
  on entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_entries_user_date on entries(user_id, date_key);

-- User settings (race date, etc.)
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  race_date text,
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;
create policy "Users manage own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
