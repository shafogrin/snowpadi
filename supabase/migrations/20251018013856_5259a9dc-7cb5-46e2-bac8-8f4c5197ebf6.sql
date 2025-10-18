-- Add reputation and avatar customization to profiles
ALTER TABLE public.profiles 
ADD COLUMN reputation INTEGER NOT NULL DEFAULT 0,
ADD COLUMN avatar_seed TEXT NOT NULL DEFAULT md5(random()::text);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on new tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges
  FOR SELECT
  USING (true);

-- User badges are viewable by authenticated users
CREATE POLICY "User badges are viewable by authenticated users"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage badges
CREATE POLICY "Only admins can manage badges"
  ON public.badges
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Insert starter badges
INSERT INTO public.badges (name, description, icon) VALUES
  ('Fresh Padi', 'Welcome to SnowPadi! This badge shows you''re part of our community.', '🌱'),
  ('First Post', 'Created your first post and shared your thoughts.', '✍️'),
  ('Helpful Padi', 'Left 10 thoughtful comments helping others.', '💬'),
  ('Rising Star', 'Earned 50 reputation points from the community.', '⭐'),
  ('Community Leader', 'Reached 100 reputation points - you''re making a difference!', '👑');

-- Function to award starter badge to new users
CREATE OR REPLACE FUNCTION public.award_starter_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  starter_badge_id UUID;
BEGIN
  -- Get the Fresh Padi badge ID
  SELECT id INTO starter_badge_id
  FROM public.badges
  WHERE name = 'Fresh Padi'
  LIMIT 1;
  
  -- Award the badge to the new user
  IF starter_badge_id IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (NEW.id, starter_badge_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to award starter badge on profile creation
CREATE TRIGGER award_starter_badge_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.award_starter_badge();

-- Function to update reputation when posts/comments are created
CREATE OR REPLACE FUNCTION public.update_reputation_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 5 points for creating a post
  UPDATE public.profiles
  SET reputation = reputation + 5
  WHERE id = NEW.author_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_reputation_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 2 points for creating a comment
  UPDATE public.profiles
  SET reputation = reputation + 2
  WHERE id = NEW.author_id;
  
  RETURN NEW;
END;
$$;

-- Triggers to update reputation
CREATE TRIGGER update_reputation_on_post_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reputation_on_post();

CREATE TRIGGER update_reputation_on_comment_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reputation_on_comment();