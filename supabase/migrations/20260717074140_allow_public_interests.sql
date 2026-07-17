-- Interests should be publicly readable (they're a shared list)
drop policy if exists "Interests are publicly readable" on public.interests;
create policy "Interests are publicly readable"
  on public.interests for select
  to anon, authenticated
  using (true);
