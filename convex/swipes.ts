import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel.d.ts";

// Returns profiles the current user hasn't swiped on yet, matching their preferences
export const getCandidates = query({
  args: {},
  handler: async (ctx): Promise<Doc<"profiles">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const myProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (!myProfile || !myProfile.isOnboarded) return [];

    // Collect IDs already swiped
    const swipes = await ctx.db
      .query("swipes")
      .withIndex("by_swiper", (q) => q.eq("swiperId", myProfile._id))
      .collect();

    const swipedIds = new Set(swipes.map((s) => s.swipedId));

    // Fetch candidates per interested gender
    const candidates: Doc<"profiles">[] = [];
    for (const gender of myProfile.interestedIn) {
      const profiles = await ctx.db
        .query("profiles")
        .withIndex("by_gender", (q) =>
          q.eq("gender", gender as "man" | "woman" | "nonbinary")
        )
        .collect();
      candidates.push(...profiles);
    }

    return candidates.filter((p) => {
      if (p._id === myProfile._id) return false;
      if (swipedIds.has(p._id)) return false;
      if (p.age < myProfile.ageMin || p.age > myProfile.ageMax) return false;
      if (!p.interestedIn.includes(myProfile.gender)) return false;
      return true;
    });
  },
});

export const recordSwipe = mutation({
  args: {
    swipedId: v.id("profiles"),
    direction: v.union(v.literal("like"), v.literal("pass"), v.literal("spotlight")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ matched: boolean; matchId?: Id<"matches"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });

    const myProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (!myProfile)
      throw new ConvexError({ code: "NOT_FOUND", message: "Profile not found" });

    // Idempotency
    const already = await ctx.db
      .query("swipes")
      .withIndex("by_swiper_and_swiped", (q) =>
        q.eq("swiperId", myProfile._id).eq("swipedId", args.swipedId)
      )
      .unique();

    if (already) return { matched: false };

    await ctx.db.insert("swipes", {
      swiperId: myProfile._id,
      swipedId: args.swipedId,
      direction: args.direction,
    });

    if (args.direction === "pass") return { matched: false };

    // Check if the other person already liked me
    const theyLikedMe = await ctx.db
      .query("swipes")
      .withIndex("by_swiper_and_swiped", (q) =>
        q.eq("swiperId", args.swipedId).eq("swipedId", myProfile._id)
      )
      .unique();

    const swipedProfile = await ctx.db.get(args.swipedId);
    let isMatch = false;

    if (
      theyLikedMe &&
      (theyLikedMe.direction === "like" || theyLikedMe.direction === "spotlight")
    ) {
      isMatch = true;
    } else if (swipedProfile?.isSeed) {
      // Deterministic ~40% match rate for seed profiles
      const combined = myProfile._id + args.swipedId;
      const hash = combined.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      isMatch = hash % 10 < 4;

      if (isMatch) {
        const alreadyReciprocal = await ctx.db
          .query("swipes")
          .withIndex("by_swiper_and_swiped", (q) =>
            q.eq("swiperId", args.swipedId).eq("swipedId", myProfile._id)
          )
          .unique();
        if (!alreadyReciprocal) {
          await ctx.db.insert("swipes", {
            swiperId: args.swipedId,
            swipedId: myProfile._id,
            direction: "like",
          });
        }
      }
    }

    if (!isMatch) return { matched: false };

    // Avoid duplicate matches
    const existingA = await ctx.db
      .query("matches")
      .withIndex("by_profile1", (q) => q.eq("profile1Id", myProfile._id))
      .filter((q) => q.eq(q.field("profile2Id"), args.swipedId))
      .first();

    const existingB = await ctx.db
      .query("matches")
      .withIndex("by_profile1", (q) => q.eq("profile1Id", args.swipedId))
      .filter((q) => q.eq(q.field("profile2Id"), myProfile._id))
      .first();

    if (existingA) return { matched: true, matchId: existingA._id };
    if (existingB) return { matched: true, matchId: existingB._id };

    const matchId = await ctx.db.insert("matches", {
      profile1Id: myProfile._id,
      profile2Id: args.swipedId,
      isActive: true,
    });

    return { matched: true, matchId };
  },
});
