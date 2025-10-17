-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict roles to authenticated users only
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix 3: Add input validation constraints
ALTER TABLE public.posts 
  ADD CONSTRAINT title_length CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  ADD CONSTRAINT content_length CHECK (char_length(content) > 0 AND char_length(content) <= 10000);

ALTER TABLE public.comments 
  ADD CONSTRAINT content_length CHECK (char_length(content) > 0 AND char_length(content) <= 2000);

ALTER TABLE public.reports 
  ADD CONSTRAINT reason_length CHECK (char_length(reason) > 0 AND char_length(reason) <= 1000);

-- Fix 4: Add search_path to generate_random_username function
CREATE OR REPLACE FUNCTION public.generate_random_username()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  random_number TEXT;
  new_username TEXT;
  username_exists BOOLEAN;
BEGIN
  LOOP
    random_number := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_username := 'SnowPadi' || random_number;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username) INTO username_exists;
    
    IF NOT username_exists THEN
      RETURN new_username;
    END IF;
  END LOOP;
END;
$$;

-- Fix 5: Add search_path to update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;