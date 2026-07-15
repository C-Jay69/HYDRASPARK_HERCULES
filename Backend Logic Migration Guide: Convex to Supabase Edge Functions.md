# Backend Logic Migration Guide: Convex to Supabase Edge Functions

## Overview

This guide provides detailed instructions for migrating backend logic from Convex mutations and actions to Supabase Edge Functions. Each Convex function has been mapped to an equivalent Edge Function with complete implementation examples.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Convex to Supabase Mapping](#convex-to-supabase-mapping)
3. [Edge Function Implementation](#edge-function-implementation)
4. [Database Operations](#database-operations)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Architecture Overview

### Convex Architecture

```
Frontend (React)
    ↓
useQuery/useMutation hooks
    ↓
Convex API
    ↓
Convex Database (Document-oriented)
```

### Supabase Architecture

```
Frontend (React)
    ↓
Supabase Client / Edge Functions
    ↓
Edge Functions (Deno)
    ↓
PostgreSQL Database (Relational)
```

## Convex to Supabase Mapping

| Convex | Supabase | Purpose |
| :--- | :--- | :--- |
| `useQuery` | `useSupabaseQuery` hook | Fetch data with real-time updates |
| `useMutation` | Edge Functions + Supabase client | Perform server-side operations |
| Convex Database | PostgreSQL | Data storage |
| Convex Actions | Edge Functions | Complex server-side logic |
| Convex Mutations | Edge Functions | Database modifications |
| Real-time queries | Supabase Realtime | Real-time data synchronization |

## Edge Function Implementation

### 1. Handle Swipe Function

**Location**: `supabase/functions/handle-swipe/index.ts`

This function processes swipe actions and creates matches when reciprocal likes occur.

**Convex Implementation** (for reference):

```typescript
// convex/swipes.ts
export const handleSwipe = mutation(
  { swiperId: v.id("profiles"), swipedId: v.id("profiles"), direction: v.string() },
  async (ctx, { swiperId, swipedId, direction }) => {
    // Insert swipe
    const swipe = await ctx.db.insert("swipes", {
      swiperId,
      swipedId,
      direction,
    });

    // Check for match
    if (direction === "like") {
      const reciprocalSwipe = await ctx.db
        .query("swipes")
        .filter((q) => q.eq(q.field("swiperId"), swipedId))
        .filter((q) => q.eq(q.field("swipedId"), swiperId))
        .filter((q) => q.eq(q.field("direction"), "like"))
        .first();

      if (reciprocalSwipe) {
        const match = await ctx.db.insert("matches", {
          profile1Id: swiperId,
          profile2Id: swipedId,
          isActive: true,
        });
        return { swipe, match, isNewMatch: true };
      }
    }

    return { swipe, isNewMatch: false };
  }
);
```

**Supabase Implementation** (already created):

See `supabase/functions/handle-swipe/index.ts` for the complete implementation.

### 2. Send Message Function

**Location**: `supabase/functions/send-message/index.ts`

This function sends chat messages and updates the match's last message timestamp.

**Convex Implementation** (for reference):

```typescript
// convex/chat.ts
export const send = mutation(
  { matchId: v.id("matches"), senderId: v.id("profiles"), content: v.string() },
  async (ctx, { matchId, senderId, content }) => {
    // Insert message
    const message = await ctx.db.insert("messages", {
      matchId,
      senderId,
      content,
    });

    // Update match
    await ctx.db.patch(matchId, {
      lastMessageAt: new Date().toISOString(),
    });

    return message;
  }
);
```

**Supabase Implementation** (already created):

See `supabase/functions/send-message/index.ts` for the complete implementation.

### 3. Update Online Status Function

**Location**: `supabase/functions/update-online-status/index.ts`

This function updates a user's last active timestamp.

**Convex Implementation** (for reference):

```typescript
// convex/users.ts
export const updateOnlineStatus = mutation(
  { profileId: v.id("profiles") },
  async (ctx, { profileId }) => {
    const profile = await ctx.db.patch(profileId, {
      lastActive: new Date().toISOString(),
    });
    return profile;
  }
);
```

**Supabase Implementation** (already created):

See `supabase/functions/update-online-status/index.ts` for the complete implementation.

## Database Operations

### Insert Operations

**Convex**:
```typescript
const user = await ctx.db.insert("users", { name: "John", email: "john@example.com" });
```

**Supabase**:
```typescript
const { data, error } = await supabase
  .from("users")
  .insert({ name: "John", email: "john@example.com" })
  .select();
```

### Query Operations

**Convex**:
```typescript
const users = await ctx.db.query("users").filter((q) => q.eq(q.field("name"), "John")).collect();
```

**Supabase**:
```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("name", "John");
```

### Update Operations

**Convex**:
```typescript
const user = await ctx.db.patch(userId, { name: "Jane" });
```

**Supabase**:
```typescript
const { data, error } = await supabase
  .from("users")
  .update({ name: "Jane" })
  .eq("id", userId)
  .select();
```

### Delete Operations

**Convex**:
```typescript
await ctx.db.delete(userId);
```

**Supabase**:
```typescript
const { error } = await supabase
  .from("users")
  .delete()
  .eq("id", userId);
```

## Error Handling

### Supabase Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId);

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
} catch (error) {
  console.error("Unexpected error:", error);
  return new Response(
    JSON.stringify({ error: error.message || "Internal server error" }),
    { status: 500 }
  );
}
```

### Common Error Scenarios

| Scenario | Error Code | Handling |
| :--- | :--- | :--- |
| Record not found | 406 | Return 404 response |
| Duplicate key | 23505 | Return 409 response |
| Foreign key violation | 23503 | Return 400 response |
| Permission denied (RLS) | 42501 | Return 403 response |
| Invalid input | 22P02 | Return 400 response |

## Testing

### Local Testing

1. Start local Supabase:
```bash
supabase start
```

2. Deploy functions locally:
```bash
supabase functions deploy handle-swipe --no-verify-jwt
```

3. Test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/handle-swipe \
  -H "Content-Type: application/json" \
  -d '{
    "swiperId": "profile-id-1",
    "swipedId": "profile-id-2",
    "direction": "like"
  }'
```

### Unit Testing

Create test files for Edge Functions:

```typescript
// supabase/functions/handle-swipe/__tests__/index.test.ts
import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts";

Deno.test("handle-swipe: creates swipe record", async () => {
  const response = await fetch("http://localhost:54321/functions/v1/handle-swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      swiperId: "profile-1",
      swipedId: "profile-2",
      direction: "like",
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.success, true);
});
```

### Integration Testing

Test the complete flow from frontend to database:

```typescript
// tests/integration/swipe.test.ts
import { supabase } from "@/lib/supabase";

describe("Swipe Integration", () => {
  it("should create a swipe and match", async () => {
    const { data: swipeData, error: swipeError } = await supabase
      .from("swipes")
      .insert({
        swiper_id: "profile-1",
        swiped_id: "profile-2",
        direction: "like",
      })
      .select();

    expect(swipeError).toBeNull();
    expect(swipeData).toBeDefined();
  });
});
```

## Deployment

### Deploy to Production

1. Ensure all functions are tested locally
2. Deploy to Supabase:

```bash
supabase functions deploy handle-swipe --project-id <project-id>
supabase functions deploy send-message --project-id <project-id>
supabase functions deploy update-online-status --project-id <project-id>
```

3. Verify deployment in Supabase dashboard

### Monitor Edge Functions

View logs in the Supabase dashboard:
- **Functions** → **Logs** tab
- Filter by function name
- Check for errors and performance metrics

### Rollback

If issues occur after deployment:

1. Identify the problematic function
2. Fix the code locally
3. Redeploy:

```bash
supabase functions deploy <function-name> --project-id <project-id>
```

## Migration Checklist

- [ ] Review all Convex mutations and actions
- [ ] Create corresponding Edge Functions
- [ ] Implement error handling
- [ ] Test functions locally
- [ ] Update frontend to call Edge Functions
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Deploy to production
- [ ] Monitor logs and performance
- [ ] Document any custom logic

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## Support

For issues or questions:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Deno documentation](https://deno.land/manual)
3. Search existing [GitHub issues](https://github.com/C-Jay69/HYDRASPARK_HERCULES/issues)
4. Create a new issue with detailed information
