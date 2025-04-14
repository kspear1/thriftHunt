-- 1. Create the table for storing challenge submissions
create table if not exists challenge_submissions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    challenge_id text,
    image_url text,
    status text default 'pending',
    created_at timestamp default now()
);

-- 2. Enable Row Level Security
alter table challenge_submissions enable row level security;

-- 3. Allow logged-in users to insert their own data
create policy "Users can insert their own submissions"
on challenge_submissions
for insert
to authenticated
with check (auth.uid() = user_id);

-- 4. Allow all authenticated users to read approved submissions
create policy "Logged in users can view approved submissions"
on challenge_submissions
for select
to authenticated
using (status = 'approved');






-- 5. policies and permissions
-- Allow authenticated users to upload files into the 'challenge-images' bucket
create policy "Authenticated users can upload to challenge-images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'challenge-images'
);

-- Allow anyone (public) to read files in the 'challenge-images' bucket
create policy "Public can read files from challenge-images"
on storage.objects
for select
to public
using (
  bucket_id = 'challenge-images'
);

-- Optional: Allow authenticated users to delete their own files (if needed later)
create policy "Users can delete their own uploads"
on storage.objects
for delete
to authenticated
using (
  auth.uid()::text = owner
  and bucket_id = 'challenge-images'
);

