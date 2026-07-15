import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel.d.ts";

// Called from auth callback - upsert user row
export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: identity.name,
        email: identity.email,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

// Get my profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
  },
});

// Create / finish onboarding
export const saveProfile = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    gender: v.union(v.literal("man"), v.literal("woman"), v.literal("nonbinary")),
    location: v.string(),
    bio: v.string(),
    photos: v.array(v.string()),
    vibeAnswers: v.array(v.number()),
    interestedIn: v.array(v.string()),
    ageMin: v.number(),
    ageMax: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    const data = {
      ...args,
      userId: identity.tokenIdentifier,
      isOnboarded: true,
      isPremium: false,
      isVerified: false,
      isAdmin: false,
      isSeed: false,
      lastActive: new Date().toISOString(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return ctx.db.insert("profiles", data);
  },
});

// Update partial profile fields
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    vibeAnswers: v.optional(v.array(v.number())),
    interestedIn: v.optional(v.array(v.string())),
    ageMin: v.optional(v.number()),
    ageMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    if (!profile) throw new ConvexError({ code: "NOT_FOUND", message: "Profile not found" });
    await ctx.db.patch(profile._id, { ...args, lastActive: new Date().toISOString() });
  },
});

// Get profile by ID (public)
export const getProfileById = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.profileId);
  },
});

// Admin: get all users (paginated)
export const adminGetProfiles = query({
  args: { paginationOpts: v.object({ numItems: v.number(), cursor: v.union(v.string(), v.null()) }) },
  handler: async (ctx, args): Promise<{ page: { _id: Id<"profiles">; name: string; age: number; location: string; isPremium: boolean; isVerified: boolean; isSeed: boolean; lastActive: string; _creationTime: number; photos: string[]; gender: string }[]; isDone: boolean; continueCursor: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    const result = await ctx.db.query("profiles").paginate(args.paginationOpts);
    return {
      ...result,
      page: result.page.map((p) => ({
        _id: p._id,
        name: p.name,
        age: p.age,
        location: p.location,
        isPremium: p.isPremium,
        isVerified: p.isVerified,
        isSeed: p.isSeed,
        lastActive: p.lastActive,
        _creationTime: p._creationTime,
        photos: p.photos,
        gender: p.gender,
      })),
    };
  },
});

// Admin suspend/verify
export const adminUpdateProfile = mutation({
  args: {
    profileId: v.id("profiles"),
    isVerified: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { profileId, ...updates } = args;
    await ctx.db.patch(profileId, updates);
  },
});

// Get seed profile count (for admin dashboard)
export const getStats = query({
  args: {},
  handler: async (ctx): Promise<{ totalProfiles: number; premiumProfiles: number }> => {
    const all = await ctx.db.query("profiles").take(500);
    return {
      totalProfiles: all.length,
      premiumProfiles: all.filter((p) => p.isPremium).length,
    };
  },
});