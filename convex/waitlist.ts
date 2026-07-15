import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    city: v.string(),
    zip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .unique();
    if (existing) throw new ConvexError({ code: "CONFLICT", message: "already_on_waitlist" });
    await ctx.db.insert("waitlist", {
      email: args.email.toLowerCase().trim(),
      city: args.city.trim(),
      zip: args.zip?.trim(),
      createdAt: new Date().toISOString(),
    });
  },
});

export const getWaitlistCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    // Return seeded base + real signups for FOMO counter
    const real = await ctx.db.query("waitlist").take(500);
    return 842 + real.length; // 842 base "claimed" spots
  },
});

export const getCityLeaderboard = query({
  args: {},
  handler: async (ctx): Promise<{ city: string; count: number }[]> => {
    const all = await ctx.db.query("waitlist").take(500);
    const tally: Record<string, number> = {};
    for (const row of all) {
      const c = row.city.toLowerCase();
      tally[c] = (tally[c] ?? 0) + 1;
    }
    return Object.entries(tally)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
});