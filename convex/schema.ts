import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  profiles: defineTable({
    userId: v.string(),
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
    isOnboarded: v.boolean(),
    isPremium: v.boolean(),
    isVerified: v.boolean(),
    isAdmin: v.boolean(),
    isSeed: v.boolean(),
    lastActive: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_seed", ["isSeed"])
    .index("by_gender", ["gender"]),

  swipes: defineTable({
    swiperId: v.id("profiles"),
    swipedId: v.id("profiles"),
    direction: v.union(v.literal("like"), v.literal("pass"), v.literal("spotlight")),
  })
    .index("by_swiper", ["swiperId"])
    .index("by_swiper_and_swiped", ["swiperId", "swipedId"]),

  matches: defineTable({
    profile1Id: v.id("profiles"),
    profile2Id: v.id("profiles"),
    isActive: v.boolean(),
    lastMessageAt: v.optional(v.string()),
  })
    .index("by_profile1", ["profile1Id"])
    .index("by_profile2", ["profile2Id"]),

  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("profiles"),
    content: v.string(),
    readAt: v.optional(v.string()),
  }).index("by_match", ["matchId"]),

  typingIndicators: defineTable({
    matchId: v.id("matches"),
    profileId: v.id("profiles"),
    updatedAt: v.string(),
  })
    .index("by_match_and_profile", ["matchId", "profileId"])
    .index("by_match", ["matchId"]),

  waitlist: defineTable({
    email: v.string(),
    city: v.string(),
    zip: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_city", ["city"]),

  icebreakers: defineTable({
    matchId: v.id("matches"),
    initiatorId: v.id("profiles"),
    initiatorStatements: v.optional(v.array(v.string())),
    initiatorLieIndex: v.optional(v.number()),
    responderGuess: v.optional(v.number()),
    responderStatements: v.optional(v.array(v.string())),
    responderLieIndex: v.optional(v.number()),
    initiatorGuess: v.optional(v.number()),
    status: v.union(
      v.literal("pending_initiator"),
      v.literal("pending_responder"),
      v.literal("complete"),
    ),
  }).index("by_match", ["matchId"]),
});