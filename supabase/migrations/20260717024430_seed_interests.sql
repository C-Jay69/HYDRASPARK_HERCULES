insert into public.interests (name, category, icon) values
  -- Sports & Fitness
  ('Yoga', 'fitness', '🧘'),
  ('Running', 'fitness', '🏃'),
  ('Gym', 'fitness', '💪'),
  ('Hiking', 'fitness', '🥾'),
  ('Cycling', 'fitness', '🚴'),
  ('Swimming', 'fitness', '🏊'),
  ('Rock Climbing', 'fitness', '🧗'),
  ('Dancing', 'fitness', '💃'),

  -- Arts & Culture
  ('Photography', 'arts', '📸'),
  ('Painting', 'arts', '🎨'),
  ('Music', 'arts', '🎵'),
  ('Live Concerts', 'arts', '🎤'),
  ('Museums', 'arts', '🏛️'),
  ('Theater', 'arts', '🎭'),
  ('Reading', 'arts', '📚'),
  ('Writing', 'arts', '✍️'),

  -- Food & Drink
  ('Cooking', 'food', '👨‍🍳'),
  ('Coffee', 'food', '☕'),
  ('Wine', 'food', '🍷'),
  ('Craft Beer', 'food', '🍺'),
  ('Fine Dining', 'food', '🍽️'),
  ('Street Food', 'food', '🌮'),
  ('Baking', 'food', '🧁'),
  ('Vegan/Vegetarian', 'food', '🥗'),

  -- Outdoors
  ('Camping', 'outdoors', '⛺'),
  ('Beach', 'outdoors', '🏖️'),
  ('Nature Walks', 'outdoors', '🌳'),
  ('Gardening', 'outdoors', '🌱'),
  ('Fishing', 'outdoors', '🎣'),
  ('Skiing', 'outdoors', '⛷️'),

  -- Tech & Gaming
  ('Video Games', 'tech', '🎮'),
  ('Board Games', 'tech', '🎲'),
  ('Tech/Startups', 'tech', '💻'),
  ('AI/ML', 'tech', '🤖'),
  ('Crypto', 'tech', '₿'),

  -- Lifestyle
  ('Travel', 'lifestyle', '✈️'),
  ('Meditation', 'lifestyle', '🕉️'),
  ('Fashion', 'lifestyle', '👗'),
  ('Movies', 'lifestyle', '🎬'),
  ('TV Shows', 'lifestyle', '📺'),
  ('Podcasts', 'lifestyle', '🎙️'),

  -- Social
  ('Volunteering', 'social', '🤝'),
  ('Politics', 'social', '🗳️'),
  ('Environment', 'social', '🌍'),
  ('Animals/Pets', 'social', '🐕')
on conflict (name) do nothing;
