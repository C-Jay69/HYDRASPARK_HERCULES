GRANT SELECT ON public.interests TO anon, authenticated;
GRANT SELECT ON public.founder_members TO anon, authenticated;

-- Drop and recreate policies to be safe
DROP POLICY IF EXISTS "Interests are publicly readable" ON public.interests;
CREATE POLICY "Interests are publicly readable" 
  ON public.interests FOR SELECT 
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Founder count is public" ON public.founder_members;
CREATE POLICY "Founder count is public" 
  ON public.founder_members FOR SELECT 
  TO anon, authenticated USING (true);

-- Seed interests (only if empty)
INSERT INTO public.interests (name, category, icon) VALUES
  ('Yoga', 'fitness', '🧘'),
  ('Running', 'fitness', '🏃'),
  ('Gym', 'fitness', '💪'),
  ('Hiking', 'fitness', '🥾'),
  ('Cycling', 'fitness', '🚴'),
  ('Swimming', 'fitness', '🏊'),
  ('Dancing', 'fitness', '💃'),
  ('Rock Climbing', 'fitness', '🧗'),
  ('Photography', 'arts', '📸'),
  ('Painting', 'arts', '🎨'),
  ('Music', 'arts', '🎵'),
  ('Live Concerts', 'arts', '🎤'),
  ('Museums', 'arts', '🏛️'),
  ('Theater', 'arts', '🎭'),
  ('Reading', 'arts', '📚'),
  ('Writing', 'arts', '✍️'),
  ('Cooking', 'food', '👨‍🍳'),
  ('Coffee', 'food', '☕'),
  ('Wine', 'food', '🍷'),
  ('Craft Beer', 'food', '🍺'),
  ('Fine Dining', 'food', '🍽️'),
  ('Baking', 'food', '🧁'),
  ('Vegan', 'food', '🥗'),
  ('Travel', 'lifestyle', '✈️'),
  ('Movies', 'lifestyle', '🎬'),
  ('TV Shows', 'lifestyle', '📺'),
  ('Podcasts', 'lifestyle', '🎙️'),
  ('Meditation', 'lifestyle', '🕉️'),
  ('Fashion', 'lifestyle', '👗'),
  ('Camping', 'outdoors', '⛺'),
  ('Beach', 'outdoors', '🏖️'),
  ('Nature', 'outdoors', '🌳'),
  ('Gardening', 'outdoors', '🌱'),
  ('Skiing', 'outdoors', '⛷️'),
  ('Video Games', 'tech', '🎮'),
  ('Board Games', 'tech', '🎲'),
  ('Tech Startups', 'tech', '💻'),
  ('AI/ML', 'tech', '🤖'),
  ('Volunteering', 'social', '🤝'),
  ('Environment', 'social', '🌍'),
  ('Animals', 'social', '🐕'),
  ('Politics', 'social', '🗳️')
ON CONFLICT (name) DO NOTHING;
