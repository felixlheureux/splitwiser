# Splitwiser Development Guide

This guide covers local environment setup, architecture conventions, testing, and development workflows across the Splitwiser monorepo.

---

## 1. Local Setup

### Prerequisites
- **Node.js** `>=24.19.0 <25` (enforced via `.nvmrc` and `package.json`)
- **pnpm** `11+` (`corepack enable` recommended)
- **OpenTofu** `1.8+` (for infrastructure changes in `infra/cloudflare`)

### Initial Workspace Bootstrap

```bash
nvm install
nvm use
corepack enable
pnpm install

# Copy environment templates
cp .env.example .env
cp workers/api/.dev.vars.example workers/api/.dev.vars

# Apply initial local SQLite/D1 migrations
pnpm db:migrate:local
```

### Starting the Local Environment

Run the services in separate terminals:

```bash
# Terminal 1: Vite React Dashboard PWA (Runs at http://localhost:5173)
pnpm dev

# Terminal 2: Vite React SEO Landing Page (Runs at http://localhost:5174)
pnpm dev:landing

# Terminal 3: Cloudflare Worker API with local D1 emulator (Runs at http://localhost:8787)
pnpm dev:api
```

---

## 2. Environment Variables & Conventions

### Browser Application (`apps/dashboard`)

Configuration exposed to the browser must use the `VITE_` prefix. These values are bundled at build time and **are not secrets**:

| Variable | Purpose | Default / Local Value |
| :--- | :--- | :--- |
| `VITE_APP_ENV` | Environment identifier | `development` |
| `VITE_API_BASE_URL` | Cloudflare Worker API base URL | `http://localhost:8787` |
| `VITE_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile widget key | `1x00000000000000000000AA` (Cloudflare test sitekey) |
| `VITE_ENABLE_MSW` | Enable Mock Service Worker (if needed) | `false` |

> [!CAUTION]
> Never store passwords, private keys, database tokens, or email API keys in `.env` or variables prefixed with `VITE_`.

### Cloudflare Worker API (`workers/api`)

The API reads secrets from `workers/api/.dev.vars` locally (which is git-ignored) and from Cloudflare Worker secrets in production:

```dotenv
BETTER_AUTH_SECRET=9169f5618d6746e52e0053db0584988d066f371e257f42ba1781e6649774ba11
INVITE_SIGNING_SECRET=0a728a1159cd38cbe704c56a35e8dcd42d9e198c272d95801e274efe21a6f0ff
RESEND_API_KEY=re_your_resend_api_key
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

In production, secrets are provisioned via Wrangler:
```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY
```

---

## 3. Database & Migrations (Cloudflare D1)

Splitwiser uses SQLite backed by Cloudflare D1 via Drizzle ORM. Migrations live in `workers/api/migrations/`:

```text
0000_better_auth.sql          # Auth schema (user, session, account, verification)
0001_initial_application_schema.sql  # Groups, members, expenses
```

### Local Migrations
```bash
pnpm db:migrate:local
```
This applies new SQL migrations to Wrangler's local SQLite emulator (`.wrangler/state/v3/d1/`).

### Remote Migrations
```bash
pnpm db:migrate:remote
```
> [!WARNING]
> Only apply remote migrations after reviewing changes and backing up production data.

---

## 4. Testing & Verification

Run the full suite of checks before opening a pull request:

```bash
# Run all lints, typechecks, integration tests, and builds
pnpm check
```

Or run targeted commands:
```bash
pnpm lint          # Run oxlint across all packages
pnpm typecheck     # TypeScript strict typechecking
pnpm test          # Run node:test integration suites (Miniflare D1 & frontend)
pnpm build         # Build production bundles (Vite PWA & Wrangler dry-run)
```

### Infrastructure Checks (OpenTofu)
```bash
tofu -chdir=infra/cloudflare fmt -check
tofu -chdir=infra/cloudflare validate
```

---

## 5. Architecture & Code Organization

```text
splitwiser/
├── apps/
│   ├── dashboard/            # React 19 + Vite PWA frontend (dash.splitwiser.app)
│   │   ├── src/
│   │   │   ├── components/   # shadcn/ui and feature components
│   │   │   │   ├── auth/     # SaveAccountModal (with Turnstile integration)
│   │   │   │   ├── expenses/ # AddExpenseSheet, ExpenseList
│   │   │   │   ├── groups/   # GroupList, GroupDetail, JoinGroupView, BalanceSummaryCard
│   │   │   │   ├── layout/   # AppHeader, AppMenuSheet, MobileShell
│   │   │   │   ├── pwa/      # InstallBanner, IOSInstallModal (platform-adaptive install UX)
│   │   │   │   └── ui/       # Radix / shadcn reusable primitives
│   │   │   ├── features/api/ # Query options, mutations, and API request fetchers
│   │   │   ├── hooks/        # useAPI, usePWAInstall
│   │   │   └── lib/          # Formatting utilities, currency helpers (formatCents)
│   │   └── vite.config.ts    # Vite + Tailwind v4 + VitePWA config
│   └── landing/              # React 19 + Vite SEO Landing Page (splitwiser.app)
│       ├── public/           # Favicons, 1200x630 og-image.png, robots.txt, sitemap.xml
│       ├── src/
│       │   ├── components/   # Hero, DebtDemo, Comparison, Features, FAQ, Header, Footer
│       │   └── index.css     # Design tokens & styles
│       └── index.html        # Comprehensive metadata, OpenGraph, and JSON-LD schemas
├── packages/shared/
│   ├── src/
│   │   ├── balance.ts        # Graph debt simplification algorithm
│   │   ├── routes.ts         # Centralized API endpoint paths
│   │   └── schemas.ts        # Shared Zod validation schemas and TypeScript types
└── workers/api/
    ├── src/
    │   ├── auth/             # Better Auth options, Turnstile verification, session cookies
    │   ├── db/               # Drizzle D1 client and SQLite schema
    │   ├── middleware/       # CORS, request ID, error handler, body-limit
    │   ├── routes/           # Hono route handlers (auth, groups, members, expenses, me, health)
    │   └── app.ts            # Hono application composition
    └── test/                 # Miniflare D1 integration test suite
```

---

## 6. Progressive Web App (PWA) Notes

- **Service Worker**: Configured via `vite-plugin-pwa` with `generateSW` strategy for precaching HTML, JS, CSS, and web manifests.
- **Platform-Adaptive Installation UX**:
  - **Android & Mobile Chrome**: Captures `beforeinstallprompt`. Offers a prominent **1-tap direct install** button. If the native trigger is unavailable or was previously dismissed, provides a 2-step guide via the browser's menu (**`⋮`** in the top or bottom corner $\rightarrow$ **"Install app"** / **"Add to Home screen"**). Never shows desktop-specific address-bar instructions on mobile devices.
  - **iOS Safari**: Provides clear visual 2-step instructions: tap the **Share icon (`⎋`)** in Safari's bottom toolbar, then tap **"Add to Home Screen" (`➕`)**.
  - **Desktop Chromium (Chrome/Edge/Brave)**: Provides 1-tap install and guides users to the Omnibox install button (**`⊕`** or **"Installer"**) in the URL address bar.
  - **Desktop Firefox/Zen**: Guides users to bookmarking shortcuts (`⌘ + D` / `Ctrl + D`) and suggests Chrome or mobile for standalone window mode.
- **Banner Dismissal**: Banner dismiss state is persisted in `localStorage` under `splitwiser_pwa_banner_dismissed`. Users can re-trigger installation anytime from the slide-out user menu.

---

## 7. Deploying to Cloudflare

Splitwiser runs 100% on Cloudflare's serverless edge. You can deploy services individually or all together using the standard `pnpm` workspace scripts:

```bash
pnpm deploy:landing     # Build & upload apps/landing to splitwiser.app
pnpm deploy:dashboard   # Build & upload apps/dashboard to dash.splitwiser.app
pnpm deploy:pages       # Deploy both landing and dashboard
pnpm deploy:api         # Run remote D1 migrations and deploy worker API
pnpm deploy:all         # Deploy full stack (API + both Pages apps)
```

### First-Time Cloudflare Infrastructure Activation

If deploying the landing site for the first time:
1. Ensure `TF_VAR_create_landing_project=true` is set in `.env` or `infra/cloudflare/terraform.tfvars`.
2. Apply the OpenTofu plan to provision `splitwiser-landing-production` and map the apex domain:
   ```bash
   pnpm infra:plan
   tofu -chdir=infra/cloudflare apply
   ```

