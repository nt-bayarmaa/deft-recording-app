-- user_friends: nickname = "how user_id calls friend_id" (only visible to user_id)
ALTER TABLE public.user_friends ADD COLUMN IF NOT EXISTS nickname text;
