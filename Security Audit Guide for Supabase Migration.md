# Security Audit Guide for Supabase Migration

## Overview

This guide provides a comprehensive framework for conducting a security audit of the HYDRASPARK_HERCULES application after migrating to Supabase. It focuses on Row Level Security (RLS), authentication, data privacy, and infrastructure security.

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [Row Level Security (RLS)](#row-level-security-rls)
3. [Data Privacy and Protection](#data-privacy-and-protection)
4. [Edge Function Security](#edge-function-security)
5. [Infrastructure and API Security](#infrastructure-and-api-security)
6. [Audit Checklist](#audit-checklist)

## Authentication Security

### 1. JWT Token Management

- **Expiry Time**: Ensure JWT tokens have a reasonable expiry time (e.g., 1 hour).
- **Refresh Tokens**: Verify refresh token rotation is enabled.
- **Secure Storage**: Ensure tokens are stored securely in the browser (e.g., HttpOnly cookies).

### 2. Password Policies

- **Complexity**: Enforce minimum password length and complexity requirements in Supabase settings.
- **Hashing**: Verify Supabase is using strong hashing algorithms (e.g., Argon2).

### 3. Multi-Factor Authentication (MFA)

- **Recommendation**: Enable MFA for sensitive user accounts and administrative access.

## Row Level Security (RLS)

### 1. RLS Policy Audit

For every table, verify the following:

- **SELECT**: Users can only see data they are authorized to view.
- **INSERT**: Users can only insert data that belongs to them.
- **UPDATE**: Users can only update their own records.
- **DELETE**: Users can only delete their own records.

### 2. Common RLS Patterns

**User Table**:
```sql
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = token_identifier);
```

**Profile Table**:
```sql
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text));
```

**Messages Table**:
```sql
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE profile1_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
      OR profile2_id = (SELECT id FROM profiles WHERE user_id = (SELECT id FROM users WHERE token_identifier = auth.uid()::text))
    )
  );
```

## Data Privacy and Protection

### 1. Sensitive Data Identification

Identify all sensitive data fields:
- Emails
- Locations
- Bio/Personal Information
- Photos

### 2. Encryption

- **At Rest**: Ensure Supabase PostgreSQL is encrypted at rest.
- **In Transit**: Verify all communication occurs over HTTPS/TLS.

### 3. Data Anonymization

For analytics and logging, ensure PII (Personally Identifiable Information) is anonymized or removed.

## Edge Function Security

### 1. JWT Validation

Ensure all Edge Functions validate the JWT before processing requests:

```typescript
const { data: { user }, error } = await supabase.auth.getUser(authHeader);
if (error || !user) {
  return new Response("Unauthorized", { status: 401 });
}
```

### 2. Service Role Key

**WARNING**: Never expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code. Use it only within Edge Functions or backend services.

### 3. Input Validation

Always validate and sanitize input in Edge Functions:

```typescript
const { swiperId, swipedId, direction } = await req.json();
if (!isValidUUID(swiperId) || !isValidUUID(swipedId) || !isValidDirection(direction)) {
  return new Response("Invalid input", { status: 400 });
}
```

## Infrastructure and API Security

### 1. CORS Configuration

Configure CORS in Supabase to allow requests only from authorized domains:

- `http://localhost:3000` (Development)
- `https://hydraspark-hercules.vercel.app` (Production)

### 2. Rate Limiting

Implement rate limiting for API endpoints to prevent brute-force attacks and DDoS:

- Use Supabase's built-in rate limiting if available.
- Implement custom rate limiting in Edge Functions using Redis or similar.

### 3. API Key Management

- **Anon Key**: Can be public but should be restricted by RLS.
- **Service Role Key**: Must remain private.
- **Environment Variables**: Use secure environment variable management in your deployment platform.

## Audit Checklist

### Authentication
- [ ] MFA enabled for admin accounts
- [ ] JWT expiry set to 1 hour
- [ ] Refresh token rotation enabled
- [ ] Email confirmation required for signup
- [ ] Secure password reset flow implemented

### Row Level Security
- [ ] RLS enabled on all tables
- [ ] Policies tested for all CRUD operations
- [ ] No "public" access to sensitive tables
- [ ] "auth.uid()" used correctly in policies
- [ ] Join-based policies verified for performance

### Data Privacy
- [ ] PII encrypted or anonymized where appropriate
- [ ] Photo storage buckets have proper access controls
- [ ] User deletion flow removes all related data
- [ ] Privacy policy updated to reflect Supabase usage

### Edge Functions
- [ ] All functions require authentication
- [ ] Input validation implemented for all endpoints
- [ ] Service role key used securely
- [ ] Error messages do not leak sensitive information
- [ ] Timeout and resource limits configured

### Infrastructure
- [ ] CORS configured correctly
- [ ] HTTPS enforced for all endpoints
- [ ] Rate limiting implemented
- [ ] Environment variables secured
- [ ] CI/CD pipeline includes security scans

## Security Testing Tools

- **Supabase CLI**: Use `supabase db test` for RLS testing.
- **OWASP ZAP**: For automated security scanning.
- **Snyk**: For dependency vulnerability scanning.
- **Postman**: For manual API security testing.

## Incident Response Plan

In case of a security breach:

1. **Detection**: Monitor logs for unusual activity.
2. **Containment**: Rotate API keys and secrets.
3. **Investigation**: Analyze logs to determine the scope of the breach.
4. **Remediation**: Fix the vulnerability and restore from backups if necessary.
5. **Notification**: Inform users and authorities as required by law.

## Resources

- [Supabase Security Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#security)
- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
