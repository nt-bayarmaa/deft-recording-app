-- Add email column to users (synced from auth.users on login)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
