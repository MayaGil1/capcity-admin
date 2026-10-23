-- Run once in the Supabase SQL Editor (as the project owner, which bypasses RLS).

-- 1. Flag that unlocks the admin panel.
alter table public.profiles
  add column if not exists is_superadmin boolean not null default false;

-- 2. Users can still edit their own name/bio/photo in CapCity, but NOT is_superadmin.
--    Without this, anyone could make themselves an admin through the API.
revoke update on public.profiles from anon, authenticated;
grant update (first_name, last_name, bio, avatar_url, updated_at) on public.profiles to authenticated;

-- 3. Avoiding the lock-out: the SQL Editor runs as the database owner, so it can set the
--    flag even though no admin exists yet. Replace the email with the Google account you use.
update public.profiles set is_superadmin = true where email = 'YOUR_GOOGLE_EMAIL@example.com';

select email, is_superadmin from public.profiles order by is_superadmin desc, email;
