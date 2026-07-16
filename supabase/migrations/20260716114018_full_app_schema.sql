-- ================================================================
-- HYDRASPARK HERCULES - Safety-First Social App Schema
-- ================================================================

-- ================================================================
-- ENUMS
-- ================================================================

create type public.app_intent as enum (
  'dating',
  'friendship',
  'networking',
  'activity_partner'
);

create type public.gender_identity as enum (
  'man',
  'woman',
  'non_binary',
  'transgender_man',
  'transgender_woman',
  'genderqueer',
  'genderfluid',
  'agender',
  'prefer_not_to_say',
  'other'
);

create type public.relationship_status as enum (
  'single',
  'open_relationship',
  'divorced',
  'widowed',
  'prefer_not_to_say'
);

create type public.verification_status as enum (
  'unverified',
  'email_verified',
  'photo_verified',
  'id_verified',
  'fully_verified'
);

create type public.membership_tier as enum (
  'founder',       -- First 1000 members, free for life
  'free',          -- Standard free tier
  'premium',       -- Paid tier
  'premium_plus'   -- Top tier
);

create type public.report_status as enum (
  'pending',
  'under_review',
  'resolved',
  'dismissed'
);

create type public.report_reason as enum (
  'fake_profile',
  'harassment',
  'inappropriate_content',
  'scam',
  'underage',
  'hate_speech',
  'spam',
  'other'
);

create type public.match_status as enum (
  'pending',
  'matched',
  'unmatched',
  'blocked'
);

create type public.meetup_status as enum (
  'proposed',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.safety_check_status as enum (
  'pending',
  'safe',
  'not_safe',
  'no_response'
);

-- ================================================================
-- EXTENDED PROFILES
-- ================================================================

alter table public.profiles add column if not exists
  username text unique,
  full_name text,
  display_name text,
  date_of_birth date,
  gender gender_identity,
  pronouns text,
  bio text,
  avatar_url text,
  banner_url text,
  location_city text,
  location_state text,
  location_country text default 'US',
  location_coords geography(point, 4326),  -- For proximity search
  intent app_intent[] default '{friendship}',
  relationship_status relationship_status default 'prefer_not_to_say',
  verification_status verification_status default 'unverified',
  membership_tier membership_tier default 'free',
  is_founder boolean default false,        -- First 1000 members flag
  is_active boolean default true,
  is_banned boolean default false,
  ban_reason text,
  last_active_at timestamptz,
  onboarding_completed boolean default false,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now();

-- ================================================================
-- FOUNDER TRACKING (First 1000 Members - Free For Life)
-- ================================================================

create table public.founder_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  founder_number integer unique not null,   -- Their founder rank (1-1000)
  granted_at timestamptz default now()
);

-- Auto-assign founder status to first 1000 users
create or replace function public.assign_founder_status()
returns trigger as $$
declare
  founder_count integer;
  next_number integer;
begin
  select count(*) into founder_count from public.founder_members;

  if founder_count < 1000 then
    next_number := founder_count + 1;

    insert into public.founder_members (user_id, founder_number)
    values (new.id, next_number);

    update public.profiles
    set membership_tier = 'founder', is_founder = true
    where id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_assign_founder
  after insert on public.profiles
  for each row execute procedure public.assign_founder_status();

-- ================================================================
-- PHOTOS
-- ================================================================

create table public.user_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,             -- Supabase Storage path
  is_primary boolean default false,
  is_verified boolean default false,      -- Photo verification
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Only one primary photo per user
create unique index only_one_primary_photo
  on public.user_photos(user_id)
  where is_primary = true;

-- ================================================================
-- INTERESTS / TAGS
-- ================================================================

create table public.interests (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  category text,                          -- e.g. 'sports', 'arts', 'food'
  icon text                               -- emoji or icon name
);

create table public.user_interests (
  user_id uuid references auth.users(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

-- ================================================================
-- MATCHING SYSTEM
-- ================================================================

create table public.swipes (
  id uuid primary key default uuid_generate_v4(),
  swiper_id uuid references auth.users(id) on delete cascade not null,
  swiped_id uuid references auth.users(id) on delete cascade not null,
  is_like boolean not null,               -- true = like, false = pass
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references auth.users(id) on delete cascade not null,
  user2_id uuid references auth.users(id) on delete cascade not null,
  status match_status default 'matched',
  matched_at timestamptz default now(),
  unmatched_at timestamptz,
  unmatched_by uuid references auth.users(id),
  unique(user1_id, user2_id)
);

-- Auto-create match when both users like each other
create or replace function public.check_for_match()
returns trigger as $$
declare
  reverse_swipe boolean;
begin
  if new.is_like = true then
    select is_like into reverse_swipe
    from public.swipes
    where swiper_id = new.swiped_id
    and swiped_id = new.swiper_id;

    if reverse_swipe = true then
      insert into public.matches (user1_id, user2_id)
      values (
        least(new.swiper_id, new.swiped_id),
        greatest(new.swiper_id, new.swiped_id)
      )
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_swipe_check_match
  after insert on public.swipes
  for each row execute procedure public.check_for_match();

-- ================================================================
-- MESSAGING
-- ================================================================

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade unique not null,
  created_at timestamptz default now(),
  last_message_at timestamptz
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- Update last_message_at on conversations
create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_message_sent
  after insert on public.messages
  for each row execute procedure public.update_conversation_timestamp();

-- ================================================================
-- SAFETY FEATURES ⚠️ (Core Feature of the App!)
-- ================================================================

-- Meetup planning with safety checks
create table public.meetups (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  proposed_by uuid references auth.users(id) not null,
  title text not null,
  location_name text not null,
  location_address text,
  location_coords geography(point, 4326),
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  status meetup_status default 'proposed',
  safety_check_in_enabled boolean default true,
  check_in_interval_minutes integer default 30,  -- How often to check in
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safety check-ins during meetups
create table public.safety_checkins (
  id uuid primary key default uuid_generate_v4(),
  meetup_id uuid references public.meetups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status safety_check_status default 'pending',
  checked_in_at timestamptz,
  location_coords geography(point, 4326),   -- Optional location share
  notes text,                                -- Any notes from user
  created_at timestamptz default now()
);

-- Emergency alerts
create table public.emergency_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  meetup_id uuid references public.meetups(id),
  alert_type text not null,                  -- 'sos', 'missed_checkin', 'manual'
  location_coords geography(point, 4326),
  is_resolved boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- Block list
create table public.blocked_users (
  blocker_id uuid references auth.users(id) on delete cascade,
  blocked_id uuid references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  reported_id uuid references auth.users(id) on delete cascade not null,
  reason report_reason not null,
  details text,
  status report_status default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ================================================================
-- SUBSCRIPTIONS / SAAS
-- ================================================================

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  tier membership_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ================================================================

alter table public.profiles enable row level security;
alter table public.founder_members enable row level security;
alter table public.user_photos enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.meetups enable row level security;
alter table public.safety_checkins enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.blocked_users enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- PROFILES
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (is_active = true and is_banned = false);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- PHOTOS
create policy "Photos viewable by authenticated users"
  on public.user_photos for select
  to authenticated using (true);

create policy "Users manage own photos"
  on public.user_photos for all
  using (auth.uid() = user_id);

-- MATCHES
create policy "Users can see own matches"
  on public.matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES
create policy "Users can see messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = conversation_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- SWIPES (private)
create policy "Users can only see own swipes"
  on public.swipes for select
  using (auth.uid() = swiper_id);

create policy "Users can create swipes"
  on public.swipes for insert
  with check (auth.uid() = swiper_id);

-- MEETUPS
create policy "Match participants can view meetups"
  on public.meetups for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- SAFETY CHECK-INS
create policy "Users can manage own check-ins"
  on public.safety_checkins for all
  using (auth.uid() = user_id);

-- BLOCKED USERS
create policy "Users manage own blocks"
  on public.blocked_users for all
  using (auth.uid() = blocker_id);

-- REPORTS
create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- SUBSCRIPTIONS
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- INTERESTS (public read)
create policy "Interests are publicly readable"
  on public.interests for select
  to authenticated using (true);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

create index idx_profiles_location on public.profiles using gist(location_coords);
create index idx_profiles_intent on public.profiles using gin(intent);
create index idx_profiles_active on public.profiles(is_active, is_banned);
create index idx_swipes_swiper on public.swipes(swiper_id);
create index idx_swipes_swiped on public.swipes(swiped_id);
create index idx_matches_users on public.matches(user1_id, user2_id);
create index idx_messages_conversation on public.messages(conversation_id, created_at);
create index idx_meetups_scheduled on public.meetups(scheduled_at);
create index idx_emergency_alerts_user on public.emergency_alerts(user_id, is_resolved);

-- ================================================================
-- ENABLE POSTGIS FOR LOCATION FEATURES
-- ================================================================
create extension if not exists postgis with schema extensions;

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_meetups_updated_at
  before update on public.meetups
  for each row execute procedure public.handle_updated_at();

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();