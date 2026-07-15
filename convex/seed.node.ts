import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Seed 67 profiles — runs in Node runtime
export const seedProfiles = action({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<string> => {
    const existing: number = await ctx.runQuery(internal.seed.countSeedProfiles);
    if (existing > 0 && !args.force) {
      return `Already seeded (${existing} profiles). Pass force=true to re-seed.`;
    }
    await ctx.runMutation(internal.seed.insertSeedProfiles);
    return "Seeded 67 profiles!";
  },
});