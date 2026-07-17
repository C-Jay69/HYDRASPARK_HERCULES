-- Create storage bucket for user photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Users can upload their own photos
create policy "Users can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-photos' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone authenticated can view photos
create policy "Photos are viewable by authenticated users"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'user-photos');

-- Users can delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own photos
create policy "Users can update own photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
