# Development guide

## Setup

Use the pinned package manager from the repository root:

```bash
nvm install
nvm use
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

The dashboard runs at http://localhost:5173. Vite reads environment files from
the repository root so all workspace apps can share documented public settings.

## Environment conventions

### Browser apps

Browser-exposed configuration must use the `VITE_` prefix. These values are
embedded into the static build and are not secrets:

| Variable            | Purpose                                      | Local example           |
| ------------------- | -------------------------------------------- | ----------------------- |
| `VITE_APP_ENV`      | App environment label                        | `development`           |
| `VITE_API_BASE_URL` | API origin used by the dashboard             | `http://localhost:8787` |
| `VITE_ENABLE_MSW`   | Enable mock-service-worker wiring when added | `false`                 |

Copy `.env.example` to `.env` for local work. It is the complete variable
inventory, but Vite only reads `VITE_*` entries and OpenTofu only reads `TF_*`
entries when they are exported into the shell. Never commit `.env`, `.env.local`,
or any file containing real credentials.

To load the OpenTofu entries into the current shell, use:

```bash
set -a; source .env; set +a
```

Then run the commands from the infrastructure guide. Worker-only secrets still
belong in `workers/api/.dev.vars`.

### Local D1 and auth

The API Worker uses Wrangler's local SQLite-backed D1 emulator by default. Apply
the numbered migrations from `workers/api` before starting the API:

```bash
pnpm --filter api db:migrate:local
pnpm --filter api dev
```

Migrations are ordered deliberately: Better Auth's generated tables are applied
first and application tables with composite foreign keys second. The
remote command is manual and must only be used after reviewing the migration:

```bash
pnpm --filter api db:migrate:remote
```

Never use `--remote` for routine local development.

### Cloudflare Worker

Keep local secrets in a Worker-specific
`.dev.vars` file and commit only a redacted `.dev.vars.example`:

```dotenv
BETTER_AUTH_SECRET=replace-with-a-local-random-value
RESEND_API_KEY=replace-with-a-local-value
TURNSTILE_SECRET_KEY=replace-if-enabled
```

Use `wrangler secret put NAME` for deployed secrets. Worker secrets must never
use the `VITE_` prefix because they must not reach the browser bundle.

## Checks before opening a merge request

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Infrastructure is managed with OpenTofu only. Local checks do not connect to
GitLab state:

```bash
tofu -chdir=infra/cloudflare init -backend=false
tofu -chdir=infra/cloudflare fmt -check -recursive
tofu -chdir=infra/cloudflare validate
```

GitHub hosts the source repository. Manual OpenTofu operations use the protected GitLab
`splitwiser-production` HTTP state. Set `TF_HTTP_*` variables as documented in
[infra/cloudflare/README.md](../infra/cloudflare/README.md), then run the plan
and apply locally. GitLab only stores and locks state; it does not deploy the
infrastructure or application. Never put backend credentials or Cloudflare
tokens in committed files.

Keep `pnpm-lock.yaml` changes with dependency changes. Do not install packages
from inside an individual workspace unless the command is intentionally scoped,
for example `pnpm --filter dashboard add <package>`.

## Adding dependencies

Use unversioned install commands and let pnpm select the version:

```bash
pnpm --filter api add zod
pnpm --filter dashboard add @tanstack/react-query
```

Commit the manifest and root lockfile together. React UI goes in the dashboard's
`components/`; API/data logic goes in `features/` and is exposed by `useAPI()`.
The backend keeps its `auth/`, `routes/`, database files, and `middleware/`.
