# HYDRASPARK_HERCULES Migration Plan: Convex to Supabase

## 1. Introduction

This document outlines the detailed plan for migrating the `HYDRASPARK_HERCULES` project from Convex to Supabase, addressing the recommendations from the audit report. The migration will cover schema translation, backend logic rewrite, frontend adaptation, and authentication rework, along with improvements for deployment readiness.

## 2. Schema Migration: Convex to Supabase (Postgres)

The existing Convex schema, defined in `convex/schema.ts`, will be translated into PostgreSQL tables. The following tables will be created in Supabase:

### 2.1 `users` Table

**Convex Schema (`users` table):**
```typescript
users: defineTable({
  tokenIdentifier: v.string(),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
}).index("by_token", ["tokenIdentifier"]),
```

**Supabase (Postgres) Schema (`users` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the user.             |
| `tokenIdentifier` | `TEXT`    | `UNIQUE`, `NOT NULL`                         | Used for authentication.                    |
| `name`          | `TEXT`    | `NULLABLE`                                   | User's display name.                        |
| `email`         | `TEXT`    | `NULLABLE`                                   | User's email address.                       |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of user creation.                 |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`, `ON UPDATE now()`           | Timestamp of last update.                   |

### 2.2 `profiles` Table

**Convex Schema (`profiles` table):**
```typescript
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
```

**Supabase (Postgres) Schema (`profiles` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the profile.          |
| `user_id`       | `UUID`    | `NOT NULL`, `UNIQUE`, `FOREIGN KEY REFERENCES users(id)` | Links to the `users` table.                 |
| `name`          | `TEXT`    | `NOT NULL`                                   | Profile name.                               |
| `age`           | `INTEGER` | `NOT NULL`                                   | User's age.                                 |
| `gender`        | `TEXT`    | `NOT NULL`                                   | Enum: 'man', 'woman', 'nonbinary'.          |
| `location`      | `TEXT`    | `NOT NULL`                                   | User's location.                            |
| `bio`           | `TEXT`    | `NOT NULL`                                   | User's biography.                           |
| `photos`        | `TEXT[]`  | `NOT NULL`, `DEFAULT '{}'`                 | Array of photo URLs.                        |
| `vibe_answers`  | `INTEGER[]` | `NOT NULL`, `DEFAULT '{}'`                 | Array of vibe answer IDs.                   |
| `interested_in` | `TEXT[]`  | `NOT NULL`, `DEFAULT '{}'`                 | Array of genders the user is interested in. |
| `age_min`       | `INTEGER` | `NOT NULL`                                   | Minimum age preference for matches.         |
| `age_max`       | `INTEGER` | `NOT NULL`                                   | Maximum age preference for matches.         |
| `is_onboarded`  | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE`                  | Indicates if onboarding is complete.        |
| `is_premium`    | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE`                  | Indicates premium status.                   |
| `is_verified`   | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE`                  | Indicates verified status.                  |
| `is_admin`      | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE`                  | Indicates admin status.                     |
| `is_seed`       | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE`                  | Indicates if it's a seed profile.           |
| `last_active`   | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`                  | Last active timestamp.                      |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of profile creation.              |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`, `ON UPDATE now()`           | Timestamp of last update.                   |

### 2.3 `swipes` Table

**Convex Schema (`swipes` table):**
```typescript
swipes: defineTable({
  swiperId: v.id("profiles"),
  swipedId: v.id("profiles"),
  direction: v.union(v.literal("like"), v.literal("pass"), v.literal("spotlight")),
})
  .index("by_swiper", ["swiperId"])
  .index("by_swiper_and_swiped", ["swiperId", "swipedId"]),
```

**Supabase (Postgres) Schema (`swipes` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the swipe.            |
| `swiper_id`     | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the profile performing the swipe.     |
| `swiped_id`     | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the profile being swiped.             |
| `direction`     | `TEXT`    | `NOT NULL`                                   | Enum: 'like', 'pass', 'spotlight'.          |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of swipe creation.                |

### 2.4 `matches` Table

**Convex Schema (`matches` table):**
```typescript
matches: defineTable({
  profile1Id: v.id("profiles"),
  profile2Id: v.id("profiles"),
  isActive: v.boolean(),
  lastMessageAt: v.optional(v.string()),
})
  .index("by_profile1", ["profile1Id"])
  .index("by_profile2", ["profile2Id"]),
```

**Supabase (Postgres) Schema (`matches` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the match.            |
| `profile1_id`   | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the first profile in the match.       |
| `profile2_id`   | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the second profile in the match.      |
| `is_active`     | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE`                   | Indicates if the match is active.           |
| `last_message_at` | `TIMESTAMP WITH TIME ZONE` | `NULLABLE`                                   | Timestamp of the last message in the match. |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of match creation.                |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`, `ON UPDATE now()`           | Timestamp of last update.                   |

### 2.5 `messages` Table

**Convex Schema (`messages` table):**
```typescript
messages: defineTable({
  matchId: v.id("matches"),
  senderId: v.id("profiles"),
  content: v.string(),
  readAt: v.optional(v.string()),
}).index("by_match", ["matchId"]),
```

**Supabase (Postgres) Schema (`messages` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the message.          |
| `match_id`      | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES matches(id)` | ID of the match the message belongs to.     |
| `sender_id`     | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the profile who sent the message.     |
| `content`       | `TEXT`    | `NOT NULL`                                   | Content of the message.                     |
| `read_at`       | `TIMESTAMP WITH TIME ZONE` | `NULLABLE`                                   | Timestamp when the message was read.        |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of message creation.              |

### 2.6 `typing_indicators` Table

**Convex Schema (`typingIndicators` table):**
```typescript
typingIndicators: defineTable({
  matchId: v.id("matches"),
  profileId: v.id("profiles"),
  updatedAt: v.string(),
})
  .index("by_match_and_profile", ["matchId", "profileId"])
  .index("by_match", ["matchId"]),
```

**Supabase (Postgres) Schema (`typing_indicators` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the typing indicator. |
| `match_id`      | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES matches(id)` | ID of the match.                            |
| `profile_id`    | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the profile typing.                   |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`, `ON UPDATE now()` | Last update timestamp.                      |

### 2.7 `waitlist` Table

**Convex Schema (`waitlist` table):**
```typescript
waitlist: defineTable({
  email: v.string(),
  city: v.string(),
  zip: v.optional(v.string()),
  createdAt: v.string(),
})
  .index("by_email", ["email"])
  .index("by_city", ["city"]),
```

**Supabase (Postgres) Schema (`waitlist` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the waitlist entry.   |
| `email`         | `TEXT`    | `NOT NULL`, `UNIQUE`                         | User's email.                               |
| `city`          | `TEXT`    | `NOT NULL`                                   | User's city.                                |
| `zip`           | `TEXT`    | `NULLABLE`                                   | User's zip code.                            |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of entry creation.                |

### 2.8 `icebreakers` Table

**Convex Schema (`icebreakers` table):**
```typescript
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
```

**Supabase (Postgres) Schema (`icebreakers` table):**

| Column Name     | Data Type | Constraints                                  | Notes                                       |
| :-------------- | :-------- | :------------------------------------------- | :------------------------------------------ |
| `id`            | `UUID`    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`   | Unique identifier for the icebreaker.       |
| `match_id`      | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES matches(id)` | ID of the match.                            |
| `initiator_id`  | `UUID`    | `NOT NULL`, `FOREIGN KEY REFERENCES profiles(id)` | ID of the profile who initiated.            |
| `initiator_statements` | `TEXT[]`  | `NULLABLE`                                   | Initiator's statements.                     |
| `initiator_lie_index` | `INTEGER` | `NULLABLE`                                   | Index of the initiator's lie.               |
| `responder_guess` | `INTEGER` | `NULLABLE`                                   | Responder's guess.                          |
| `responder_statements` | `TEXT[]`  | `NULLABLE`                                   | Responder's statements.                     |
| `responder_lie_index` | `INTEGER` | `NULLABLE`                                   | Index of the responder's lie.               |
| `initiator_guess` | `INTEGER` | `NULLABLE`                                   | Initiator's guess.                          |
| `status`        | `TEXT`    | `NOT NULL`                                   | Enum: 'pending_initiator', 'pending_responder', 'complete'. |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                              | Timestamp of icebreaker creation.           |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`, `ON UPDATE now()`           | Timestamp of last update.                   |

## 3. Backend Logic Rewrite: Convex Mutations/Actions to Supabase Edge Functions

This section will detail the conversion of Convex mutations and actions into Supabase Edge Functions. Each Convex function will be mapped to an equivalent Edge Function, with database interactions rewritten to use the Supabase client for PostgreSQL.

### 3.1 `users.create`

**Convex:** Creates a new user profile.
**Supabase Edge Function:** An Edge Function will handle user creation, inserting a new record into the `users` and `profiles` tables after successful authentication via Supabase Auth.

### 3.2 `users.update`

**Convex:** Updates an existing user profile.
**Supabase Edge Function:** An Edge Function will update records in the `profiles` table based on the provided `user_id`.

### 3.3 `users.updateOnlineStatus`

**Convex:** Updates a user's online status.
**Supabase Edge Function:** An Edge Function will update the `last_active` column in the `profiles` table. Real-time presence can be handled via Supabase Realtime.

### 3.4 `swipes.create`

**Convex:** Records a swipe action.
**Supabase Edge Function:** An Edge Function will insert a new record into the `swipes` table.

### 3.5 `swipes.handleSwipe`

**Convex:** Processes a swipe, checks for a potential match, and creates a match entry if successful. This is a critical action involving multiple database operations and conditional logic.
**Supabase Edge Function:** This will be a complex Edge Function that:
1.  Inserts the swipe into the `swipes` table.
2.  Checks if a reciprocal swipe exists.
3.  If a match occurs, inserts a new record into the `matches` table.
4.  Potentially triggers real-time events via Supabase Realtime for both users.

### 3.6 `chat.send`

**Convex:** Sends a chat message.
**Supabase Edge Function:** An Edge Function will insert a new record into the `messages` table and update `last_message_at` in the `matches` table. Supabase Realtime will be used to broadcast the new message to the chat participants.

## 4. Frontend Adaptation

The frontend will require significant changes to adapt from Convex's `useQuery` and `useMutation` hooks to the Supabase client library.

### 4.1 Authentication

Replace Convex authentication with Supabase Auth. This will involve updating login/signup flows and session management.

### 4.2 Data Fetching and Mutations

Rewrite all `useQuery` and `useMutation` calls to use the Supabase client. This will involve:
*   Direct calls to Supabase PostgreSQL for simple data fetching.
*   Invoking Supabase Edge Functions for complex operations (e.g., `handleSwipe`).

### 4.3 Real-time Subscriptions

Implement explicit real-time subscriptions using Supabase Realtime for features requiring live updates, such as:
*   `getProfilesToSwipe` (for dynamic filtering/updates).
*   `getMatches` (to show new matches).
*   `chat.get` (for real-time chat messages).
*   `typingIndicators` (for real-time typing status).

## 5. Deployment Readiness Improvements

### 5.1 Environment Variable Documentation

Create a `.env.example` file with all required environment variables, including placeholders for Supabase API keys, project URL, and JWT secret.

### 5.2 CI/CD Pipeline

Recommend setting up a CI/CD pipeline (e.g., using GitHub Actions, Vercel, or Netlify) to automate:
*   Code linting and testing.
*   Building the Next.js application.
*   Deploying Supabase Edge Functions.
*   Deploying the frontend application.

### 5.3 Monitoring and Logging

Recommend integrating monitoring and logging solutions (e.g., Sentry for error tracking, Logtail for log aggregation) to ensure application stability and performance in production.

### 5.4 Security Audit

Recommend conducting a thorough security audit after the migration, especially focusing on Row Level Security (RLS) in Supabase, API authentication, and data access policies for Edge Functions.

## 6. Next Steps

Proceed with setting up the Supabase project and implementing the schema migration. This will involve creating the necessary tables and relationships in a Supabase PostgreSQL database.
