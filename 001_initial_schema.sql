-- HYDRASPARK_HERCULES Supabase Schema Migration
-- This migration creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE gender_enum AS ENUM ('man', 'woman', 'nonbinary');
CREATE TYPE swipe_direction AS ENUM ('like', 'pass', 'spotlight');
CREATE TYPE icebreaker_status AS ENUM ('pending_initiator', 'pending_responder', 'complete');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_identifier TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on token_identifier for faster lookups
CREATE INDEX idx_users_token_identifier ON users(token_identifier);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender gender_enum NOT NULL,
  location TEXT NOT NULL,
  bio TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  vibe_answers INTEGER[] NOT NULL DEFAULT '{}',
  interested_in TEXT[] NOT NULL DEFAULT '{}',
  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_seed ON profiles(is_seed);
CREATE INDEX idx_profiles_gender ON profiles(gender);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on swipes
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiper_and_swiped ON swipes(swiper_id, swiped_id);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on matches
CREATE INDEX idx_matches_profile1_id ON matches(profile1_id);
CREATE INDEX idx_matches_profile2_id ON matches(profile2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on messages
CREATE INDEX idx_messages_match_id ON messages(match_id);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes on typing_indicators
CREATE INDEX idx_typing_indicators_match_and_profile ON typing_indicators(match_id, profile_id);
CREATE INDEX idx_typing_indicators_match ON typing_indicators(match_id);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on waitlist
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_city ON waitlist(city);

-- Icebreakers table
CREATE TABLE IF NOT EXISTS icebreakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  initiator_statements TEXT[],
  initiator_lie_index INTEGER,
  responder_guess INTEGER,
  responder_statements TEXT[],
  responder_lie_index INTEGER,
  initiator_guess INTEGER,
  status icebreaker_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes on icebreakers
CREATE INDEX idx_icebreakers_match_id ON icebreakers(match_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icebreakers_updated_at BEFORE UPDATE ON icebreakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE icebreakers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = token_identifier);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = token_identifier);

-- RLS Policies for profiles table
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text));

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text));

-- RLS Policies for swipes table
CREATE POLICY "Swipes are viewable by the swiper"
  ON swipes FOR SELECT
  USING (swiper_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text)));

CREATE POLICY "Users can create swipes"
  ON swipes FOR INSERT
  WITH CHECK (swiper_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text)));

-- RLS Policies for matches table
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (
    profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
  );

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

CREATE POLICY "Users can insert messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    AND match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

-- RLS Policies for typing_indicators table
CREATE POLICY "Users can view typing indicators in their matches"
  ON typing_indicators FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

CREATE POLICY "Users can update typing indicators"
  ON typing_indicators FOR INSERT
  WITH CHECK (
    profile_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
  );

-- RLS Policies for icebreakers table
CREATE POLICY "Users can view icebreakers in their matches"
  ON icebreakers FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

CREATE POLICY "Users can create icebreakers"
  ON icebreakers FOR INSERT
  WITH CHECK (
    initiator_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    AND match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

CREATE POLICY "Users can update icebreakers"
  ON icebreakers FOR UPDATE
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );

-- RLS Policies for waitlist table
CREATE POLICY "Anyone can view waitlist"
  ON waitlist FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert into waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);
