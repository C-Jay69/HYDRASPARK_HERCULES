# Testing Guide for Supabase Migration

## Overview

This guide provides comprehensive testing strategies for the HYDRASPARK_HERCULES application after migrating from Convex to Supabase. It covers unit tests, integration tests, end-to-end tests, and performance testing.

## Table of Contents

1. [Setup](#setup)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [End-to-End Tests](#end-to-end-tests)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Testing Checklist](#testing-checklist)

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitest/ui
npm install --save-dev cypress @cypress/schematic
npm install --save-dev lighthouse
```

### Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Setup Test Environment

Create `src/vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi } from "vitest";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    channel: vi.fn(),
  },
}));

// Setup environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
```

## Unit Tests

### Test Supabase Client

```typescript
// tests/unit/supabase.test.ts
import { describe, it, expect, vi } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Supabase Client", () => {
  it("should be initialized", () => {
    expect(supabase).toBeDefined();
  });

  it("should have auth method", () => {
    expect(supabase.auth).toBeDefined();
  });

  it("should have from method for database queries", () => {
    expect(supabase.from).toBeDefined();
  });

  it("should have channel method for realtime", () => {
    expect(supabase.channel).toBeDefined();
  });
});
```

### Test Custom Hooks

```typescript
// tests/unit/use-supabase-query.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { supabase } from "@/lib/supabase";

describe("useSupabaseQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch data", async () => {
    const mockData = [{ id: "1", name: "Test" }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    } as any);

    const { result } = renderHook(() =>
      useSupabaseQuery("profiles", (q) => q.select("*"))
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("should handle errors", async () => {
    const mockError = new Error("Database error");
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    } as any);

    const { result } = renderHook(() =>
      useSupabaseQuery("profiles", (q) => q.select("*"))
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
```

### Test Auth Hook

```typescript
// tests/unit/use-auth.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/components/providers/supabase-auth";
import { supabase } from "@/lib/supabase";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sign in user", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("test@example.com", "password");
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });

  it("should sign up user", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("test@example.com", "password");
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });
});
```

## Integration Tests

### Test Edge Functions

```typescript
// tests/integration/edge-functions.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Edge Functions", () => {
  let testProfileId1: string;
  let testProfileId2: string;

  beforeAll(async () => {
    // Create test profiles
    const { data: profile1 } = await supabase
      .from("profiles")
      .insert({
        user_id: "test-user-1",
        name: "Test User 1",
        age: 25,
        gender: "man",
        location: "Test City",
        bio: "Test bio",
        age_min: 20,
        age_max: 30,
      })
      .select()
      .single();

    const { data: profile2 } = await supabase
      .from("profiles")
      .insert({
        user_id: "test-user-2",
        name: "Test User 2",
        age: 26,
        gender: "woman",
        location: "Test City",
        bio: "Test bio",
        age_min: 20,
        age_max: 30,
      })
      .select()
      .single();

    testProfileId1 = profile1.id;
    testProfileId2 = profile2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from("profiles").delete().eq("id", testProfileId1);
    await supabase.from("profiles").delete().eq("id", testProfileId2);
  });

  it("should handle swipe and create match", async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/handle-swipe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          swiperId: testProfileId1,
          swipedId: testProfileId2,
          direction: "like",
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.swipe).toBeDefined();
  });

  it("should send message", async () => {
    // First create a match
    const { data: match } = await supabase
      .from("matches")
      .insert({
        profile1_id: testProfileId1,
        profile2_id: testProfileId2,
        is_active: true,
      })
      .select()
      .single();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/send-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          matchId: match.id,
          senderId: testProfileId1,
          content: "Hello!",
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
  });
});
```

### Test Database Operations

```typescript
// tests/integration/database.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Database Operations", () => {
  let testUserId: string;
  let testProfileId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase
      .from("users")
      .insert({
        token_identifier: `test-user-${Date.now()}`,
        name: "Test User",
        email: "test@example.com",
      })
      .select()
      .single();

    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testProfileId) {
      await supabase.from("profiles").delete().eq("id", testProfileId);
    }
    if (testUserId) {
      await supabase.from("users").delete().eq("id", testUserId);
    }
  });

  it("should insert profile", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: testUserId,
        name: "Test Profile",
        age: 25,
        gender: "man",
        location: "Test City",
        bio: "Test bio",
        age_min: 20,
        age_max: 30,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe("Test Profile");
    testProfileId = data.id;
  });

  it("should update profile", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: "Updated Profile" })
      .eq("id", testProfileId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe("Updated Profile");
  });

  it("should query profiles", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", testProfileId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(testProfileId);
  });
});
```

## End-to-End Tests

### Setup Cypress

Create `cypress.config.ts`:

```typescript
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### Write E2E Tests

```typescript
// cypress/e2e/auth.cy.ts
describe("Authentication", () => {
  it("should sign up a new user", () => {
    cy.visit("/auth");
    cy.get('input[name="email"]').type("newuser@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/app");
  });

  it("should log in existing user", () => {
    cy.visit("/auth");
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/app");
  });

  it("should log out user", () => {
    cy.login("test@example.com", "password123");
    cy.get('button[aria-label="logout"]').click();
    cy.url().should("include", "/auth");
  });
});
```

```typescript
// cypress/e2e/swiping.cy.ts
describe("Swiping", () => {
  beforeEach(() => {
    cy.login("test@example.com", "password123");
    cy.visit("/app/discover");
  });

  it("should display profiles to swipe", () => {
    cy.get('[data-testid="swipe-card"]').should("be.visible");
  });

  it("should swipe left", () => {
    cy.get('[data-testid="swipe-card"]').first().within(() => {
      cy.get('button[aria-label="pass"]').click();
    });
    cy.get('[data-testid="swipe-card"]').should("have.length.greaterThan", 0);
  });

  it("should swipe right", () => {
    cy.get('[data-testid="swipe-card"]').first().within(() => {
      cy.get('button[aria-label="like"]').click();
    });
    cy.get('[data-testid="swipe-card"]').should("have.length.greaterThan", 0);
  });
});
```

## Performance Testing

### Lighthouse Testing

```bash
npm run lighthouse -- http://localhost:3000
```

### Database Query Performance

```typescript
// tests/performance/database.test.ts
import { describe, it, expect } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Database Performance", () => {
  it("should fetch profiles within 500ms", async () => {
    const start = performance.now();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(500);
  });

  it("should handle large result sets efficiently", async () => {
    const start = performance.now();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .limit(1000);

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(2000);
    expect(data).toHaveLength(1000);
  });
});
```

## Security Testing

### Test Row Level Security

```typescript
// tests/security/rls.test.ts
import { describe, it, expect } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Row Level Security", () => {
  it("should not allow users to view other users' data", async () => {
    // This test should fail if RLS is not properly configured
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .neq("id", "current-user-id");

    // Should either return empty or error
    expect(data?.length || 0).toBe(0);
  });

  it("should allow users to view their own profile", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", "current-user-id");

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## Testing Checklist

### Unit Tests
- [ ] Supabase client initialization
- [ ] Custom hooks (useSupabaseQuery, useTypingIndicator, usePresence)
- [ ] Auth functions (signIn, signUp, signOut)
- [ ] Helper functions (handleSwipe, sendMessage, updateOnlineStatus)
- [ ] Type definitions and interfaces

### Integration Tests
- [ ] Edge Functions (handle-swipe, send-message, update-online-status)
- [ ] Database operations (CRUD)
- [ ] Real-time subscriptions
- [ ] Authentication flow
- [ ] Match creation logic

### End-to-End Tests
- [ ] User signup and login
- [ ] Profile creation and editing
- [ ] Swiping and matching
- [ ] Chat messaging
- [ ] Logout

### Performance Tests
- [ ] Database query performance
- [ ] API response times
- [ ] Frontend rendering performance
- [ ] Real-time update latency

### Security Tests
- [ ] Row Level Security policies
- [ ] Authentication token validation
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] CORS configuration

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test File

```bash
npm run test -- tests/unit/supabase.test.ts
```

### Run Tests with Coverage

```bash
npm run test -- --coverage
```

### Run E2E Tests

```bash
npm run cypress:open
```

### Run Performance Tests

```bash
npm run test -- tests/performance
```

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Documentation](https://testing-library.com)
- [Cypress Documentation](https://docs.cypress.io)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
