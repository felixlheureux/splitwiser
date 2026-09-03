# Splitwiser API

The API is a single Cloudflare Worker. It owns Better Auth, application
endpoints, D1 access, Resend delivery, and scheduled maintenance.

## Local development

Run these commands from the repository root:

```bash
cp workers/api/.dev.vars.example workers/api/.dev.vars
pnpm db:migrate:local
pnpm dev:api
```

Wrangler uses the local D1 emulator by default. It reads secrets from
`workers/api/.dev.vars`; that file is ignored by Git. The local API is available
at http://localhost:8787.

## Checks

```bash
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api build
```

`typecheck` and `build` regenerate `worker-configuration.d.ts` from
`wrangler.jsonc`. Do not hand-edit that generated file.

## Migrations

Migrations are numbered and applied with Wrangler:

```text
0000_better_auth.sql          Better Auth generated tables
0001_initial_application_schema.sql
0002_same_group_integrity.sql  Cross-group database guards
```

Use `pnpm db:migrate:local` for local work. The remote command is manual and
requires an intentional `--remote` operation after reviewing the SQL:

```bash
pnpm db:migrate:remote
```

Better Auth schema generation uses `src/auth/generation.config.ts` and Drizzle
Kit. Regenerate and review its SQL whenever the auth configuration or plugin
set changes.

## Structure

```text
src/app.ts              Worker composition
src/auth/               Better Auth and auth schema generation
src/middleware/         Request ID, CORS, and error middleware
src/routes/             HTTP route modules
src/app-schema.ts       Drizzle application tables
src/db.ts               D1 Drizzle client factory
migrations/             Numbered D1 SQL migrations
```
