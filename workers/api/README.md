# Splitwiser API

The API is a single Cloudflare Worker. It owns Better Auth, application
endpoints, D1 access, and Resend delivery.

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

`pnpm dev:api` sets the API and dashboard origins to localhost. Production
origins live in `wrangler.jsonc`; set its D1 ID before deploying. No database
or Worker is deployed by the check commands below.

## Sign-in

The dashboard POSTs an email and its callback URL to
`/api/auth/sign-in/magic-link`. Resend delivers a single-use link. Clicking it
verifies the email, sets a host-only session cookie, and redirects to the app
automatically. Links last ten minutes and are stored hashed. Sessions last
90 days and can renew every 30 days. Better Auth rate limits live in D1.

New users save a display name through `PATCH /api/v1/me` before creating a
group. `POST /api/v1/groups` accepts `{ name, currencyCode }`; the server
derives the currency's decimal places. Requests use `credentials: include`.

On iOS, an email link may open Safari instead of the installed app. It signs
into that browser; there is no code fallback or automatic session transfer.

## Checks

```bash
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api build
pnpm --filter api test
```

`typecheck` and `build` regenerate `worker-configuration.d.ts` from
`wrangler.jsonc`. Do not hand-edit that generated file.

## Migrations

Migrations are numbered and applied with Wrangler:

```text
0000_better_auth.sql          Better Auth generated tables
0001_initial_application_schema.sql
```

Use `pnpm db:migrate:local` for local work. The remote command is manual and
requires an intentional `--remote` operation after reviewing the SQL:

```bash
pnpm db:migrate:remote
```

Better Auth schema generation uses `src/auth/generation.config.ts` and Drizzle
Kit. Regenerate and review its SQL whenever the auth configuration or plugin
set changes.

The initial migrations were edited in place while the project is a scaffold.
An already-migrated development database must be recreated to use this schema;
reapplying migrations does not change existing tables. Tests always use fresh,
isolated databases and never reset your local or remote data.

Application migrations define the constraints; Drizzle maps the tables used
by routes. Composite foreign keys replace same-group triggers. Participants
and memberships stay separate to support people without accounts.

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

Routes call Drizzle directly. There are no controller/service/repository
layers. Shared auth options keep runtime and schema generation consistent,
and the email module contains the single Resend call.

The integration tests use Miniflare's local D1 and intercept email delivery.
They cover link verification/reuse/expiry, redirects, sessions, profile
validation, currency handling, group creation, and persistent rate limits.
