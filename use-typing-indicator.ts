import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useTypingIndicator(matchId: string, profileId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const typingTimeoutRef = new React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup realtime channel for typing indicators
    const typingChannel = supabase
      .channel(`match:${matchId}:typing`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const typingIndicator = payload.new;
            if (typingIndicator.profile_id !== profileId) {
              setTypingUsers((prev) => {
                if (!prev.includes(typingIndicator.profile_id)) {
                  return [...prev, typingIndicator.profile_id];
                }
                return prev;
              });

              // Clear typing indicator after 3 seconds
              setTimeout(() => {
                setTypingUsers((prev) =>
                  prev.filter((id) => id !== typingIndicator.profile_id)
                );
              }, 3000);
            }
          } else if (payload.eventType === "DELETE") {
            const typingIndicator = payload.old;
            setTypingUsers((prev) =>
              prev.filter((id) => id !== typingIndicator.profile_id)
            );
          }
        }
      )
      .subscribe();

    setChannel(typingChannel);

    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel);
      }
    };
  }, [matchId, profileId]);

  const setUserTyping = async (typing: boolean) => {
    setIsTyping(typing);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      // Insert or update typing indicator
      const { error } = await supabase
        .from("typing_indicators")
        .upsert(
          {
            match_id: matchId,
            profile_id: profileId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "match_id,profile_id",
          }
        );

      if (error) {
        console.error("Error setting typing indicator:", error);
      }

      // Auto-clear typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        clearUserTyping();
      }, 3000);
    } else {
      await clearUserTyping();
    }
  };

  const clearUserTyping = async () => {
    setIsTyping(false);

    const { error } = await supabase
      .from("typing_indicators")
      .delete()
      .eq("match_id", matchId)
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error clearing typing indicator:", error);
    }
  };

  return {
    isTyping,
    typingUsers,
    setUserTyping,
  };
}

// Re-export React for use in the hook
import React from "react";
