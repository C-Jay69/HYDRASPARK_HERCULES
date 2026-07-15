import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel.d.ts";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireProfile(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
    .unique();
  if (!profile) throw new ConvexError({ code: "NOT_FOUND", message: "Profile not found" });
  return profile;
}

// ─── Messages ───────────────────────────────────────────────────────────────

export const getMessages = query({
  args: { matchId: v.id("matches"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<{ page: Doc<"messages">[]; isDone: boolean; continueCursor: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };
    return ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const sendMessage = mutation({
  args: { matchId: v.id("matches"), content: v.string() },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    const profile = await requireProfile(ctx);
    if (!args.content.trim()) throw new ConvexError({ code: "BAD_REQUEST", message: "Empty message" });

    const msgId = await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: profile._id,
      content: args.content.trim(),
    });

    await ctx.db.patch(args.matchId, { lastMessageAt: new Date().toISOString() });

    // Clear typing indicator
    const typing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_match_and_profile", (q) =>
        q.eq("matchId", args.matchId).eq("profileId", profile._id)
      )
      .unique();
    if (typing) await ctx.db.delete(typing._id);

    return msgId;
  },
});

export const markRead = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) =>
        q.and(
          q.neq(q.field("senderId"), profile._id),
          q.eq(q.field("readAt"), undefined)
        )
      )
      .collect();
    const now = new Date().toISOString();
    for (const msg of unread) {
      await ctx.db.patch(msg._id, { readAt: now });
    }
  },
});

// ─── Typing indicators ───────────────────────────────────────────────────────

export const setTyping = mutation({
  args: { matchId: v.id("matches"), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_match_and_profile", (q) =>
        q.eq("matchId", args.matchId).eq("profileId", profile._id)
      )
      .unique();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { updatedAt: new Date().toISOString() });
      } else {
        await ctx.db.insert("typingIndicators", {
          matchId: args.matchId,
          profileId: profile._id,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      if (existing) await ctx.db.delete(existing._id);
    }
  },
});

export const getTypingIndicators = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args): Promise<{ profileId: Id<"profiles">; updatedAt: string }[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    if (!profile) return [];

    const all = await ctx.db
      .query("typingIndicators")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    // Only return the other person's typing indicator (not mine), and only if recent (< 5s)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    return all
      .filter((t) => t.profileId !== profile._id && t.updatedAt > fiveSecondsAgo)
      .map((t) => ({ profileId: t.profileId, updatedAt: t.updatedAt }));
  },
});

// ─── Icebreakers ─────────────────────────────────────────────────────────────

export const getIcebreaker = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args): Promise<Doc<"icebreakers"> | null> => {
    return ctx.db
      .query("icebreakers")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
  },
});

export const startIcebreaker = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args): Promise<Id<"icebreakers">> => {
    const profile = await requireProfile(ctx);
    const existing = await ctx.db
      .query("icebreakers")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    if (existing) return existing._id;
    return ctx.db.insert("icebreakers", {
      matchId: args.matchId,
      initiatorId: profile._id,
      status: "pending_initiator",
    });
  },
});

export const submitInitiatorStatements = mutation({
  args: {
    matchId: v.id("matches"),
    statements: v.array(v.string()),
    lieIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const icebreaker = await ctx.db
      .query("icebreakers")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    if (!icebreaker) throw new ConvexError({ code: "NOT_FOUND", message: "No icebreaker" });
    if (icebreaker.initiatorId !== profile._id)
      throw new ConvexError({ code: "FORBIDDEN", message: "Not the initiator" });
    await ctx.db.patch(icebreaker._id, {
      initiatorStatements: args.statements,
      initiatorLieIndex: args.lieIndex,
      status: "pending_responder",
    });
  },
});

export const submitResponderTurn = mutation({
  args: {
    matchId: v.id("matches"),
    guess: v.number(),
    statements: v.array(v.string()),
    lieIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await requireProfile(ctx);
    const icebreaker = await ctx.db
      .query("icebreakers")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    if (!icebreaker) throw new ConvexError({ code: "NOT_FOUND", message: "No icebreaker" });
    await ctx.db.patch(icebreaker._id, {
      responderGuess: args.guess,
      responderStatements: args.statements,
      responderLieIndex: args.lieIndex,
      status: "complete",
    });
  },
});

export const submitInitiatorGuess = mutation({
  args: { matchId: v.id("matches"), guess: v.number() },
  handler: async (ctx, args) => {
    const icebreaker = await ctx.db
      .query("icebreakers")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    if (!icebreaker) throw new ConvexError({ code: "NOT_FOUND", message: "No icebreaker" });
    await ctx.db.patch(icebreaker._id, { initiatorGuess: args.guess });
  },
});