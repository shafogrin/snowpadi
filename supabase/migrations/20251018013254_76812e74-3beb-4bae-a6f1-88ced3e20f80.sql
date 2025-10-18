-- Revert profiles table to be publicly readable
-- This is necessary because posts and comments are publicly viewable
-- and need to display usernames. The randomly generated usernames 
-- (SnowPadi####) don't contain PII.

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);