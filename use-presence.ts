import { useEffect, useState } from "react";
import { supabase, updateOnlineStatus } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceState {
  profileId: string;
  lastActive: string;
}

export function usePresence(profileId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, PresenceState>>(
    new Map()
  );
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const updateIntervalRef = new React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!profileId) return;

    // Update online status immediately
    updateOnlineStatus(profileId).catch(console.error);

    // Setup realtime channel for presence
    const presenceChannel = supabase
      .channel(`presence:profiles`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const profile = payload.new;
          const lastActiveTime = new Date(profile.last_active).getTime();
          const now = new Date().getTime();
          const isOnline = now - lastActiveTime < 5 * 60 * 1000; // 5 minutes

          if (isOnline) {
            setOnlineUsers((prev) => {
              const newMap = new Map(prev);
              newMap.set(profile.id, {
                profileId: profile.id,
                lastActive: profile.last_active,
              });
              return newMap;
            });
          } else {
            setOnlineUsers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(profile.id);
              return newMap;
            });
          }
        }
      )
      .subscribe();

    setChannel(presenceChannel);

    // Update online status every 30 seconds
    updateIntervalRef.current = setInterval(() => {
      updateOnlineStatus(profileId).catch(console.error);
    }, 30000);

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [profileId]);

  const isOnline = (targetProfileId: string): boolean => {
    return onlineUsers.has(targetProfileId);
  };

  const getLastActive = (targetProfileId: string): string | null => {
    const presence = onlineUsers.get(targetProfileId);
    return presence?.lastActive ?? null;
  };

  return {
    onlineUsers,
    isOnline,
    getLastActive,
  };
}

// Re-export React for use in the hook
import React from "react";
