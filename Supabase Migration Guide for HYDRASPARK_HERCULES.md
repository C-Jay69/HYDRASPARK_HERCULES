# Supabase Migration Guide for HYDRASPARK_HERCULES

## Overview

This document provides a comprehensive guide for migrating the HYDRASPARK_HERCULES application from Convex to Supabase. The migration includes database schema translation, backend logic rewrite, frontend adaptation, and deployment readiness improvements.

## Migration Status

| Component | Status | Notes |
| :--- | :--- | :--- |
| Database Schema | ✅ Complete | SQL migration file created with all tables and relationships |
| Edge Functions | ✅ Complete | `handle-swipe`, `send-message`, `update-online-status` functions created |
| Frontend Utilities | ✅ Complete | Supabase client and custom hooks created |
| Environment Configuration | ✅ Complete | `.env.example` and CI/CD pipeline created |
| Documentation | ✅ Complete | Migration plan and deployment guide created |
| Testing | ⏳ Pending | Unit and integration tests need to be implemented |
| Data Migration | ⏳ Pending | Scripts to migrate existing Convex data to Supabase |

## Key Changes

### 1. Database Schema

The Convex schema has been translated to PostgreSQL tables with the following improvements:

- **UUID Primary Keys**: All tables use UUID primary keys for better scalability
- **Timestamps**: All tables include `created_at` and `updated_at` timestamps
- **Foreign Keys**: Proper relationships between tables with CASCADE delete rules
- **Indexes**: Strategic indexes for frequently queried columns
- **Enums**: Custom PostgreSQL enums for `gender`, `swipe_direction`, and `icebreaker_status`
- **Row Level Security**: RLS policies to ensure data privacy and security

### 2. Backend Logic

Convex mutations and actions have been converted to Supabase Edge Functions:

- **handle-swipe**: Processes swipe actions and creates matches when reciprocal likes occur
- **send-message**: Sends chat messages and broadcasts updates via Realtime
- **update-online-status**: Updates user online status and broadcasts presence

### 3. Frontend Integration

The frontend has been updated to use the Supabase client library:

- **Supabase Client**: Centralized client configuration and type definitions
- **Custom Hooks**: `useSupabaseQuery` and `useSupabaseSingleQuery` for data fetching with real-time support
- **Helper Functions**: `handleSwipe`, `sendMessage`, `updateOnlineStatus` for common operations

### 4. Authentication

Authentication has been migrated from Convex to Supabase Auth:

- **Supabase Auth**: Built-in authentication service with email/password, OAuth, and multi-factor authentication support
- **JWT Tokens**: Secure JWT-based authentication
- **Session Management**: Automatic session management and token refresh

## File Structure

```
HYDRASPARK_HERCULES/
├── supabase/
│   ├── config.toml                    # Supabase configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Database schema migration
│   └── functions/
│       ├── handle-swipe/
│       │   └── index.ts               # Handle swipe Edge Function
│       ├── send-message/
│       │   └── index.ts               # Send message Edge Function
│       └── update-online-status/
│           └── index.ts               # Update online status Edge Function
├── src/
│   ├── lib/
│   │   └── supabase.ts                # Supabase client and utilities
│   └── hooks/
│       └── use-supabase-query.ts      # Custom hooks for queries
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD pipeline
├── .env.example                       # Environment variables template
├── migration_plan.md                  # Detailed migration plan
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
└── SUPABASE_MIGRATION.md              # This file
```

## Migration Steps

### Step 1: Setup Supabase Project

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note your project URL and API keys
3. Set up environment variables in `.env.local`

### Step 2: Apply Database Schema

```bash
supabase db push
```

This will create all tables, indexes, and RLS policies.

### Step 3: Deploy Edge Functions

```bash
supabase functions deploy handle-swipe --project-id <your-project-id>
supabase functions deploy send-message --project-id <your-project-id>
supabase functions deploy update-online-status --project-id <your-project-id>
```

### Step 4: Migrate Data (if applicable)

If you have existing data in Convex:

1. Export data from Convex
2. Transform data to match PostgreSQL schema
3. Import data into Supabase

### Step 5: Update Frontend Code

Replace Convex imports with Supabase:

```typescript
// Before (Convex)
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// After (Supabase)
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { handleSwipe } from "@/lib/supabase";
```

### Step 6: Test Locally

```bash
npm run dev
```

Test all features locally before deploying to production.

### Step 7: Deploy to Production

```bash
npm run build
vercel deploy --prod
```

## Real-time Features

Supabase Realtime provides real-time capabilities similar to Convex:

### Subscribing to Changes

```typescript
import { useSupabaseQuery } from "@/hooks/use-supabase-query";

const { data: messages, loading } = useSupabaseQuery(
  "messages",
  (q) => q.select("*").eq("match_id", matchId),
  { realtime: true }
);
```

### Broadcasting Events

```typescript
const channel = supabase.channel(`match:${matchId}`);
await channel.send({
  type: "broadcast",
  event: "new_message",
  payload: { message },
});
```

## Authentication Flow

### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});
```

### Signup

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password",
});
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## Row Level Security (RLS)

RLS policies ensure that users can only access their own data:

- **Users**: Can only view and update their own profile
- **Profiles**: Can view all profiles, but only update their own
- **Messages**: Can only view and send messages in their matches
- **Matches**: Can only view matches they're part of

## Performance Considerations

1. **Indexes**: All frequently queried columns have indexes for fast lookups
2. **Query Optimization**: Use specific columns in SELECT queries instead of SELECT *
3. **Pagination**: Implement pagination for large result sets
4. **Caching**: Use client-side caching to reduce database queries
5. **Connection Pooling**: Supabase handles connection pooling automatically

## Troubleshooting

### Common Issues

**Issue**: "Failed to apply migrations"
- **Solution**: Check that Supabase CLI is installed and up-to-date

**Issue**: "Edge Function deployment failed"
- **Solution**: Verify the function code for syntax errors and check project ID

**Issue**: "Real-time subscriptions not working"
- **Solution**: Ensure Realtime is enabled in Supabase project settings and RLS policies are correct

**Issue**: "Authentication not working"
- **Solution**: Verify Supabase Auth is enabled and redirect URLs are configured

## Next Steps

1. **Testing**: Implement comprehensive unit and integration tests
2. **Monitoring**: Set up error tracking and logging with Sentry and Logtail
3. **Performance**: Monitor database performance and optimize queries as needed
4. **Security**: Conduct a thorough security audit, especially for RLS policies
5. **Documentation**: Update application documentation to reflect Supabase integration

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Search existing [GitHub issues](https://github.com/C-Jay69/HYDRASPARK_HERCULES/issues)
3. Create a new issue with detailed information about the problem
4. Contact Supabase support at [support@supabase.io](mailto:support@supabase.io)
