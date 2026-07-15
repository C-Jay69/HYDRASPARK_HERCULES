import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel.d.ts";

export type MatchWithProfile = {
  matchId: Id<"matches">;
  profile: Doc<"profiles">;
  lastMessageAt?: string;
  lastMessage?: string;
  unreadCount: number;
};

export const getMyMatches = query({
  args: {},
  handler: async (ctx): Promise<MatchWithProfile[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const myProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    if (!myProfile) return [];

    const [matches1, matches2] = await Promise.all([
      ctx.db.query("matches").withIndex("by_profile1", (q) => q.eq("profile1Id", myProfile._id)).collect(),
      ctx.db.query("matches").withIndex("by_profile2", (q) => q.eq("profile2Id", myProfile._id)).collect(),
    ]);

    const allMatches = [...matches1, ...matches2].filter((m) => m.isActive);

    const result: MatchWithProfile[] = [];
    for (const match of allMatches) {
      const otherId = match.profile1Id === myProfile._id ? match.profile2Id : match.profile1Id;
      const profile = await ctx.db.get(otherId);
      if (!profile) continue;

      // Get last message
      const lastMsg = await ctx.db
        .query("messages")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .order("desc")
        .first();

      // Unread count (messages from the other person I haven't read)
      const unread = await ctx.db
        .query("messages")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .filter((q) =>
          q.and(q.neq(q.field("senderId"), myProfile._id), q.eq(q.field("readAt"), undefined))
        )
        .collect();

      result.push({
        matchId: match._id,
        profile,
        lastMessageAt: match.lastMessageAt,
        lastMessage: lastMsg?.content,
        unreadCount: unread.length,
      });
    }

    return result.sort((a, b) =>
      (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")
    );
  },
});