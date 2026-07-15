# Monitoring and Logging Guide for HYDRASPARK_HERCULES

## Overview

This guide provides instructions for setting up comprehensive monitoring and logging for the HYDRASPARK_HERCULES application. It covers error tracking, log aggregation, performance monitoring, and alerting.

## Table of Contents

1. [Error Tracking with Sentry](#error-tracking-with-sentry)
2. [Log Aggregation with Logtail](#log-aggregation-with-logtail)
3. [Performance Monitoring](#performance-monitoring)
4. [Supabase Monitoring](#supabase-monitoring)
5. [Alerting and Notifications](#alerting-and-notifications)

## Error Tracking with Sentry

### 1. Installation

```bash
npm install @sentry/nextjs
```

### 2. Configuration

Run the Sentry wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will create `sentry.client.config.js`, `sentry.server.config.js`, and `sentry.edge.config.js`.

### 3. Environment Variables

Add to `.env.local`:

```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 4. Usage

Sentry will automatically capture unhandled exceptions. For manual error reporting:

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code here
} catch (error) {
  Sentry.captureException(error);
}
```

## Log Aggregation with Logtail

### 1. Installation

```bash
npm install @logtail/node
```

### 2. Configuration

Create a logger utility `src/lib/logger.ts`:

```typescript
import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

export const logger = {
  info: (message: string, data?: any) => {
    console.log(message, data);
    logtail.info(message, data);
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
    logtail.error(message, { error });
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
    logtail.warn(message, data);
  },
};
```

### 3. Environment Variables

Add to `.env.local`:

```
LOGTAIL_TOKEN=your-logtail-token
```

## Performance Monitoring

### 1. Next.js Web Vitals

Next.js provides built-in support for measuring Web Vitals. Add this to `src/app/layout.tsx`:

```typescript
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    // Send to your analytics service
  })
}
```

### 2. Supabase Query Performance

Monitor slow queries in the Supabase dashboard under **Database** → **Query Performance**.

### 3. Edge Function Latency

Monitor Edge Function execution time in the Supabase dashboard under **Functions** → **Metrics**.

## Supabase Monitoring

### 1. Database Health

Check database health metrics in the Supabase dashboard:
- CPU usage
- Memory usage
- Disk I/O
- Active connections

### 2. API Usage

Monitor API request volume and error rates in the Supabase dashboard under **API** → **Metrics**.

### 3. Realtime Connections

Track active Realtime connections and message volume in the Supabase dashboard under **Realtime** → **Metrics**.

## Alerting and Notifications

### 1. Sentry Alerts

Configure alert rules in Sentry to notify you via:
- Email
- Slack
- PagerDuty

### 2. Supabase Alerts

Enable alerts for:
- Database disk usage
- High CPU/Memory usage
- Edge Function errors

### 3. Custom Alerting

Implement custom alerting in your Edge Functions for critical business events:

```typescript
if (error) {
  await notifySlack(`Critical Error in handle-swipe: ${error.message}`);
}
```

## Monitoring Checklist

- [ ] Sentry initialized for client, server, and edge
- [ ] Logtail configured for log aggregation
- [ ] Web Vitals being tracked
- [ ] Supabase query performance monitored
- [ ] Edge Function logs and metrics enabled
- [ ] Slack notifications configured for critical errors
- [ ] Weekly performance reports scheduled
- [ ] Dashboard created for key metrics

## Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Logtail Documentation](https://betterstack.com/docs/logs/javascript/nodejs/)
- [Next.js Web Vitals](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Supabase Monitoring Guide](https://supabase.com/docs/guides/platform/monitoring)
