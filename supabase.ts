import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface User {
  id: string;
  token_identifier: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: "man" | "woman" | "nonbinary";
  location: string;
  bio: string;
  photos: string[];
  vibe_answers: number[];
  interested_in: string[];
  age_min: number;
  age_max: number;
  is_onboarded: boolean;
  is_premium: boolean;
  is_verified: boolean;
  is_admin: boolean;
  is_seed: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: "like" | "pass" | "spotlight";
  created_at: string;
}

export interface Match {
  id: string;
  profile1_id: string;
  profile2_id: string;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  match_id: string;
  profile_id: string;
  updated_at: string;
}

export interface Waitlist {
  id: string;
  email: string;
  city: string;
  zip: string | null;
  created_at: string;
}

export interface Icebreaker {
  id: string;
  match_id: string;
  initiator_id: string;
  initiator_statements: string[] | null;
  initiator_lie_index: number | null;
  responder_guess: number | null;
  responder_statements: string[] | null;
  responder_lie_index: number | null;
  initiator_guess: number | null;
  status: "pending_initiator" | "pending_responder" | "complete";
  created_at: string;
  updated_at: string;
}

// Helper function to handle swipes
export async function handleSwipe(
  swiperId: string,
  swipedId: string,
  direction: "like" | "pass" | "spotlight"
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/handle-swipe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        swiperId,
        swipedId,
        direction,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to handle swipe");
  }

  return response.json();
}

// Helper function to send a message
export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/send-message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        matchId,
        senderId,
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

// Helper function to update online status
export async function updateOnlineStatus(profileId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/update-online-status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        profileId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update online status");
  }

  return response.json();
}
