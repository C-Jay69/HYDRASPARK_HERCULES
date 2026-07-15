# HYDRASPARK_HERCULES Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the HYDRASPARK_HERCULES application from Convex to Supabase, including local development setup, database migration, and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Migration](#database-migration)
4. [Environment Configuration](#environment-configuration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher
- npm or yarn package manager
- Docker (for local Supabase setup)
- Git
- Supabase CLI (`npm install -g supabase`)
- Vercel CLI (optional, for Vercel deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/C-Jay69/HYDRASPARK_HERCULES.git
cd HYDRASPARK_HERCULES
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase Locally

Initialize Supabase in your project:

```bash
supabase init
```

Start the Supabase local development environment:

```bash
supabase start
```

This will start PostgreSQL, the Supabase API, and other services locally. You'll see output with connection details.

### 4. Create Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the values from your local Supabase setup:

```bash
cp .env.example .env.local
```

Update `.env.local` with your local Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

### 5. Run Database Migrations

Apply the schema migrations to your local Supabase instance:

```bash
supabase db push
```

This will execute the SQL migration files in the `supabase/migrations` directory.

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Migration

### 1. Export Data from Convex (if applicable)

If you have existing data in Convex, export it using the Convex CLI:

```bash
convex export --format json
```

### 2. Transform Data for Postgres

Create a migration script to transform the exported Convex data into PostgreSQL format. This typically involves:

- Converting Convex document IDs to UUIDs
- Mapping Convex collections to PostgreSQL tables
- Handling nested objects and arrays appropriately

### 3. Import Data into Supabase

Once transformed, import the data into your Supabase instance:

```bash
psql -h localhost -p 54322 -U postgres -d postgres -f data_import.sql
```

Or use the Supabase dashboard to import CSV files.

## Environment Configuration

### Development Environment

Create `.env.local` with development values:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key>
NODE_ENV=development
```

### Staging Environment

Create `.env.staging` with staging values:

```
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
NODE_ENV=staging
```

### Production Environment

Set environment variables in your deployment platform (Vercel, Netlify, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>
NODE_ENV=production
```

## Edge Functions Deployment

### 1. Deploy to Supabase

Deploy the Edge Functions to your Supabase project:

```bash
supabase functions deploy handle-swipe --project-id <your-project-id>
supabase functions deploy send-message --project-id <your-project-id>
supabase functions deploy update-online-status --project-id <your-project-id>
```

### 2. Verify Deployment

Check the Supabase dashboard to confirm the functions are deployed and accessible.

### 3. Test Edge Functions

Use the Supabase dashboard or curl to test the Edge Functions:

```bash
curl -X POST https://<your-project>.supabase.co/functions/v1/handle-swipe \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "swiperId": "profile-id-1",
    "swipedId": "profile-id-2",
    "direction": "like"
  }'
```

## Frontend Deployment

### Option 1: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy:

```bash
vercel deploy --prod
```

### Option 2: Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set environment variables in the Netlify dashboard
5. Deploy

### Option 3: Deploy to Self-Hosted Server

1. Build the application:

```bash
npm run build
```

2. Install production dependencies:

```bash
npm install --production
```

3. Start the server:

```bash
npm start
```

## Monitoring and Logging

### 1. Setup Sentry for Error Tracking

Install Sentry:

```bash
npm install @sentry/nextjs
```

Configure Sentry in your application and set the `SENTRY_DSN` environment variable.

### 2. Setup Logtail for Log Aggregation

Install Logtail:

```bash
npm install @logtail/node
```

Configure Logtail in your application and set the `LOGTAIL_TOKEN` environment variable.

### 3. Enable Supabase Logs

Access Supabase logs in the dashboard:

- **Edge Function Logs**: View logs for deployed Edge Functions
- **Database Logs**: Monitor database query performance and errors
- **API Logs**: Track API requests and responses

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure all required environment variables are set in `.env.local` or your deployment platform's environment configuration.

### Issue: "Failed to connect to database"

**Solution**: 
- Verify the database URL is correct
- Check that the database is running (for local development)
- Ensure network connectivity to the database server

### Issue: "Edge Function deployment failed"

**Solution**:
- Check the Supabase CLI is installed and up-to-date: `npm install -g supabase@latest`
- Verify your Supabase project ID is correct
- Check the Edge Function code for syntax errors

### Issue: "Real-time subscriptions not working"

**Solution**:
- Ensure Realtime is enabled in your Supabase project settings
- Verify Row Level Security (RLS) policies are correctly configured
- Check that the subscription is listening to the correct table and event

### Issue: "Authentication not working"

**Solution**:
- Verify Supabase Auth is enabled in your project
- Check that the redirect URL is correctly configured
- Ensure the Supabase Auth provider is properly initialized in your frontend

## Security Considerations

1. **Row Level Security (RLS)**: Ensure RLS policies are properly configured for all tables
2. **API Keys**: Keep your service role key secret and never expose it in client-side code
3. **CORS**: Configure CORS settings in Supabase to allow requests from your frontend domain
4. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse
5. **Data Validation**: Always validate and sanitize user input on the backend

## Performance Optimization

1. **Database Indexing**: Ensure all frequently queried columns have indexes
2. **Query Optimization**: Use efficient SQL queries and avoid N+1 problems
3. **Caching**: Implement caching strategies for frequently accessed data
4. **CDN**: Use a CDN to serve static assets
5. **Code Splitting**: Implement code splitting in your Next.js application

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [GitHub Issues](https://github.com/C-Jay69/HYDRASPARK_HERCULES/issues)
