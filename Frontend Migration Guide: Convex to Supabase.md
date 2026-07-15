# Frontend Migration Guide: Convex to Supabase

## Overview

This guide provides step-by-step instructions for migrating the frontend from Convex to Supabase. It includes code examples showing the before and after implementations for common patterns.

## Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Data Fetching](#data-fetching)
4. [Mutations](#mutations)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [Component Examples](#component-examples)
7. [Testing](#testing)

## Setup

### Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

### Create Supabase Client

**File**: `src/lib/supabase.ts` (already created)

This file exports the Supabase client and type definitions for all database tables.

### Update Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

## Authentication

### Convex Authentication (Before)

```typescript
// Before: Using Convex Auth
import { useAuth } from "@convex-dev/react";

export function LoginComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}</div>;
}
```

### Supabase Authentication (After)

```typescript
// After: Using Supabase Auth
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function LoginComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### Login Function

**Convex** (Before):
```typescript
// Not applicable - Convex handles auth through system
```

**Supabase** (After):
```typescript
import { supabase } from "@/lib/supabase";

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    throw error;
  }

  return data;
}
```

### Signup Function

**Supabase**:
```typescript
export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error);
    throw error;
  }

  return data;
}
```

### Logout Function

**Supabase**:
```typescript
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
```

## Data Fetching

### Convex Query (Before)

```typescript
// Before: Using Convex useQuery
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProfileComponent() {
  const profile = useQuery(api.users.getProfile);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return <div>{profile.name}</div>;
}
```

### Supabase Query (After)

```typescript
// After: Using Supabase client
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

export function ProfileComponent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return <div>{profile.name}</div>;
}
```

### Using Custom Hook (Recommended)

```typescript
// After: Using custom hook
import { useSupabaseSingleQuery } from "@/hooks/use-supabase-query";
import type { Profile } from "@/lib/supabase";

export function ProfileComponent() {
  const { data: profile, loading } = useSupabaseSingleQuery<Profile>(
    "profiles",
    userId,
    { realtime: true }
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return <div>{profile.name}</div>;
}
```

## Mutations

### Convex Mutation (Before)

```typescript
// Before: Using Convex useMutation
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UpdateProfileComponent() {
  const updateProfile = useMutation(api.users.updateProfile);

  const handleUpdate = async (name: string) => {
    try {
      await updateProfile({ name });
      console.log("Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <button onClick={() => handleUpdate("New Name")}>
      Update Profile
    </button>
  );
}
```

### Supabase Mutation (After)

```typescript
// After: Using Supabase client directly
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function UpdateProfileComponent() {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (name: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("user_id", user.id);

      if (error) throw error;

      console.log("Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleUpdate("New Name")} disabled={loading}>
      {loading ? "Updating..." : "Update Profile"}
    </button>
  );
}
```

## Real-time Subscriptions

### Convex Real-time (Before)

```typescript
// Before: Convex queries are automatically real-time
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ChatComponent({ matchId }: { matchId: string }) {
  // This automatically updates when new messages are added
  const messages = useQuery(api.chat.getMessages, { matchId });

  return (
    <div>
      {messages?.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Supabase Real-time (After)

```typescript
// After: Using Supabase Realtime subscription
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import type { Message } from "@/lib/supabase";

export function ChatComponent({ matchId }: { matchId: string }) {
  const { data: messages, loading } = useSupabaseQuery<Message>(
    "messages",
    (q) => q.select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
    { realtime: true }
  );

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div>
      {messages?.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Component Examples

### Swipe Card Component

**Before (Convex)**:
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SwipeCard({ profile }: { profile: any }) {
  const handleSwipe = useMutation(api.swipes.handleSwipe);

  const onSwipeLeft = async () => {
    await handleSwipe({
      swiperId: currentProfile.id,
      swipedId: profile.id,
      direction: "pass",
    });
  };

  const onSwipeRight = async () => {
    await handleSwipe({
      swiperId: currentProfile.id,
      swipedId: profile.id,
      direction: "like",
    });
  };

  return (
    <div>
      <img src={profile.photos[0]} alt={profile.name} />
      <button onClick={onSwipeLeft}>Pass</button>
      <button onClick={onSwipeRight}>Like</button>
    </div>
  );
}
```

**After (Supabase)**:
```typescript
import { useState } from "react";
import { handleSwipe } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

export function SwipeCard({ 
  profile, 
  currentProfileId 
}: { 
  profile: Profile;
  currentProfileId: string;
}) {
  const [loading, setLoading] = useState(false);

  const onSwipeLeft = async () => {
    try {
      setLoading(true);
      await handleSwipe(currentProfileId, profile.id, "pass");
    } catch (error) {
      console.error("Error swiping:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSwipeRight = async () => {
    try {
      setLoading(true);
      const result = await handleSwipe(currentProfileId, profile.id, "like");
      if (result.isNewMatch) {
        console.log("New match!");
      }
    } catch (error) {
      console.error("Error swiping:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img src={profile.photos[0]} alt={profile.name} />
      <button onClick={onSwipeLeft} disabled={loading}>
        Pass
      </button>
      <button onClick={onSwipeRight} disabled={loading}>
        Like
      </button>
    </div>
  );
}
```

### Chat Component

**Before (Convex)**:
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function ChatComponent({ matchId }: { matchId: string }) {
  const [message, setMessage] = useState("");
  const messages = useQuery(api.chat.getMessages, { matchId });
  const sendMessage = useMutation(api.chat.send);

  const handleSend = async () => {
    await sendMessage({ matchId, content: message });
    setMessage("");
  };

  return (
    <div>
      <div className="messages">
        {messages?.map((msg) => (
          <div key={msg._id}>{msg.content}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

**After (Supabase)**:
```typescript
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { sendMessage } from "@/lib/supabase";
import { useState } from "react";
import type { Message } from "@/lib/supabase";

export function ChatComponent({ 
  matchId, 
  currentProfileId 
}: { 
  matchId: string;
  currentProfileId: string;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: messages } = useSupabaseQuery<Message>(
    "messages",
    (q) => q.select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
    { realtime: true }
  );

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      await sendMessage(matchId, currentProfileId, message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages?.map((msg) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
// tests/unit/supabase.test.ts
import { describe, it, expect } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Supabase Client", () => {
  it("should be initialized", () => {
    expect(supabase).toBeDefined();
  });

  it("should have auth method", () => {
    expect(supabase.auth).toBeDefined();
  });

  it("should have from method", () => {
    expect(supabase.from).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect } from "vitest";
import { login, logout } from "@/lib/auth";

describe("Authentication", () => {
  it("should login successfully", async () => {
    const result = await login("test@example.com", "password");
    expect(result.user).toBeDefined();
  });

  it("should logout successfully", async () => {
    await logout();
    // Verify user is logged out
  });
});
```

## Migration Checklist

- [ ] Install Supabase dependencies
- [ ] Create Supabase client (`src/lib/supabase.ts`)
- [ ] Update environment variables
- [ ] Create custom hooks for data fetching
- [ ] Migrate authentication flows
- [ ] Update all data fetching components
- [ ] Update all mutation components
- [ ] Implement real-time subscriptions
- [ ] Test all components locally
- [ ] Deploy to staging
- [ ] Run integration tests
- [ ] Deploy to production

## Common Patterns

### Fetch Single Record

```typescript
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", profileId)
  .single();
```

### Fetch Multiple Records

```typescript
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("gender", "man")
  .order("created_at", { ascending: false });
```

### Insert Record

```typescript
const { data, error } = await supabase
  .from("profiles")
  .insert({ name: "John", age: 25 })
  .select();
```

### Update Record

```typescript
const { data, error } = await supabase
  .from("profiles")
  .update({ name: "Jane" })
  .eq("id", profileId)
  .select();
```

### Delete Record

```typescript
const { error } = await supabase
  .from("profiles")
  .delete()
  .eq("id", profileId);
```

## Resources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
