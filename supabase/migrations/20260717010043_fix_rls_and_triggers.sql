-- ================================================================
-- FIX 1: Auto-create profile when user signs up (proper pattern)
-- ================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger fires when a new user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- FIX 2: Allow anyone to READ founder count (for landing page)
-- ================================================================

drop policy if exists "Founder count is public" on public.founder_members;
create policy "Founder count is public"
  on public.founder_members for select
  to anon, authenticated
  using (true);

-- ================================================================
-- FIX 3: Allow authenticated users to INSERT their own profile
-- (backup in case trigger is bypassed)
-- ================================================================

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ================================================================
-- FIX 4: Allow users to read their own profile even before others
-- ================================================================

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);
