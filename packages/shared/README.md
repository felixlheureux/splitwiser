# @splitwiser/shared

Platform-neutral contracts shared by the dashboard and API Worker.

## Owns

- Zod request and response schemas
- Inferred TypeScript types
- API error envelopes
- IDs, dates, currencies, and domain validation

## Must not own

- React or DOM code
- Hono or Cloudflare APIs
- Better Auth or Drizzle runtime clients
- IndexedDB or service-worker behavior
- Secrets

Add shared schemas under `src/schemas` and export them from `src/index.ts`.
Validate changes with:

```bash
pnpm --filter @splitwiser/shared typecheck
```
