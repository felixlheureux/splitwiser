# Splitwiser

Splitwiser is an open-source alternative to Splitwise for people who want the
basics to stay simple and accessible. It is a mobile-first shared expense ledger
for groups, with clear balances, repayment suggestions, and an installable PWA.

Built in response to essential expense-sharing features becoming increasingly
paywalled, Splitwiser keeps the core workflow focused: record expenses, see who
owes what, and settle up without a subscription for basic use. The product and
technical contract live in [SPEC.md](SPEC.md).

## Prerequisites

- Node.js 24.19.0 (see `.nvmrc`)
- pnpm 11+

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5173. The dashboard is the current workspace app; the API
and shared package provide its runtime foundation.

Useful commands:

```bash
pnpm build       # Production build
pnpm lint        # Oxlint
pnpm typecheck   # TypeScript project check
pnpm preview     # Serve the production build locally
pnpm dev:api     # Run the Cloudflare Worker locally
pnpm check       # Run lint, typecheck, and all builds
```

## Environment variables

The dashboard loads the root `.env` file through Vite's `envDir` configuration.
Start from [.env.example](.env.example):

```bash
cp .env.example .env
```

Only variables prefixed with `VITE_` are exposed to browser code. They may hold
public configuration such as the API base URL, but never passwords, tokens,
private keys, database credentials, or email provider secrets. Local `.env`
files are ignored by Git; keep the example file current when adding a variable.

Worker-only secrets will use Wrangler `.dev.vars` files locally and Wrangler
secrets in deployed environments. Do not put those values in `.env`,
`wrangler.jsonc`, source code, or committed configuration.

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full local setup and
environment conventions.

## Workspace layout

```text
apps/dashboard/   React + Vite PWA
packages/         Shared browser/Worker contracts
workers/          Cloudflare Workers API
infra/cloudflare/ OpenTofu-managed Cloudflare resources
```
