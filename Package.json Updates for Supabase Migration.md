# Package.json Updates for Supabase Migration

## Required Dependencies

To use Supabase in your HYDRASPARK_HERCULES project, add the following dependencies to your `package.json`:

### Production Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.7.0",
    "@supabase/auth-helpers-react": "^0.4.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@supabase/cli": "^1.88.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Installation

Run the following command to install all Supabase-related dependencies:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
npm install --save-dev @supabase/cli
```

Or with yarn:

```bash
yarn add @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
yarn add --dev @supabase/cli
```

## Dependencies Explanation

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@supabase/supabase-js` | ^2.38.0 | Core Supabase client library for JavaScript/TypeScript |
| `@supabase/auth-helpers-nextjs` | ^0.7.0 | Next.js integration for Supabase Auth |
| `@supabase/auth-helpers-react` | ^0.4.0 | React hooks for Supabase Auth |
| `@supabase/cli` | ^1.88.0 | Command-line interface for Supabase management |

## Removing Convex Dependencies

Remove the following Convex-related dependencies from your `package.json`:

```bash
npm uninstall convex @convex-dev/react
npm uninstall --save-dev convex
```

## Updated package.json Example

Here's an example of what your `package.json` might look like after the migration:

```json
{
  "name": "hydraspark-hercules",
  "version": "1.0.0",
  "description": "A modern dating app built with Next.js and Supabase",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "vitest",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:db:push": "supabase db push",
    "supabase:functions:deploy": "supabase functions deploy"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.7.0",
    "@supabase/auth-helpers-react": "^0.4.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "vitest": "^0.34.0",
    "@supabase/cli": "^1.88.0"
  }
}
```

## Npm Scripts

Add the following scripts to your `package.json` for easier Supabase management:

```json
{
  "scripts": {
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:db:push": "supabase db push",
    "supabase:db:pull": "supabase db pull",
    "supabase:functions:deploy": "supabase functions deploy",
    "supabase:functions:list": "supabase functions list",
    "supabase:status": "supabase status"
  }
}
```

## Usage Examples

### Start Local Supabase

```bash
npm run supabase:start
```

### Push Database Migrations

```bash
npm run supabase:db:push
```

### Deploy Edge Functions

```bash
npm run supabase:functions:deploy
```

### Check Supabase Status

```bash
npm run supabase:status
```

## Migration Checklist

- [ ] Install Supabase dependencies
- [ ] Remove Convex dependencies
- [ ] Update `.env.local` with Supabase credentials
- [ ] Create `supabase/config.toml` file
- [ ] Run database migrations
- [ ] Deploy Edge Functions
- [ ] Update frontend code to use Supabase client
- [ ] Test application locally
- [ ] Deploy to production

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution**: Ensure all dependencies are installed:
```bash
npm install
```

### Issue: "Supabase CLI not found"

**Solution**: Install Supabase CLI globally:
```bash
npm install -g @supabase/cli
```

### Issue: "Module not found: '@supabase/auth-helpers-nextjs'"

**Solution**: Install the auth helpers package:
```bash
npm install @supabase/auth-helpers-nextjs
```

## Version Management

Keep your Supabase packages up-to-date:

```bash
npm update @supabase/supabase-js
npm update @supabase/auth-helpers-nextjs
npm update @supabase/auth-helpers-react
npm update @supabase/cli
```

Or update all packages:

```bash
npm update
```

## Additional Resources

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [NPM Package: @supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js)
- [NPM Package: @supabase/cli](https://www.npmjs.com/package/@supabase/cli)
