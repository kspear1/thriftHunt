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

-- Created Profile table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  total_points integer default 0
);

-- Triggers to add a new user after every signup to profiles
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure handle_new_user();

-- function to increment points
create or replace function increment_user_points(user_id_input uuid, points_to_add int)
returns void as $$
begin
  update profiles
  set total_points = total_points + points_to_add
  where id = user_id_input;
end;
$$ language plpgsql;

-- Allow service role to access any row
create policy "Service role can read all submissions"
on challenge_submissions
for select
to service_role
using (true);

-- creates table to hold item redemptions
create table if not exists redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  reward_id text,
  redeemed_at timestamp default now()
);

-- adds a check constrinet for challenge_submissions
alter table challenge_submissions
add constraint status_check
check (status in ('approved', 'pending', 'rejected'));

-- Allow users to view their own submissions (all statuses)
create policy "Users can view their own submissions"
on challenge_submissions
for select
to authenticated
using (auth.uid() = user_id);



