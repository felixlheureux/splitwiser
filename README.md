<div align="center">

# Splitwiser

**Free forever. Open source. Made for sharing.**

An open-source alternative to Splitwise for people who want shared expenses to stay simple, fair, and accessible — without subscriptions, paywalled features, or mandatory app-store downloads.

[![Open Source](https://img.shields.io/badge/Open-Source-0d9488?style=flat-square)](https://github.com/felixlheureux/splitwiser)
[![Free Forever](https://img.shields.io/badge/Free-Forever-10b981?style=flat-square)](https://github.com/felixlheureux/splitwiser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Cloudflare $0 Stack](https://img.shields.io/badge/Cloudflare-$0/mo-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://cloudflare.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](https://splitwiser.app)

[**Try the Web App**](https://dash.splitwiser.app) · [**Report Bug**](https://github.com/felixlheureux/splitwiser/issues) · [**Support on Buy Me a Coffee**](https://buymeacoffee.com/felixlheureux)

</div>

---

## Why Splitwiser?

Most expense-sharing apps started out helpful, but gradually locked basic features behind monthly subscriptions: delays when adding expenses, receipt limits, daily caps, and clunky ads.

Splitwiser is designed around a simple philosophy: **splitting a dinner bill or cabin trip with friends should never cost money or require everyone to create an account.**

- 💚 **Free Forever & Open Source** — No premium tiers, no hidden subscriptions, no ads. Built for the community.
- ⚡ **Zero-Friction (Guest Mode First)** — Create a group in seconds and start recording. Friends can view and add expenses without creating an account or downloading an app.
- 🔗 **One-Click Share Links** — Send one invite link or short code. Friends tap, pick their name (or add a new one), and they're in.
- 📱 **Mobile-First Installable PWA** — Feels like a native iOS and Android app. Install directly from your browser to your home screen with offline caching.
- ⚖️ **Smart Debt Simplification** — Automatically calculates the minimum number of repayments needed so everyone settles up fairly with zero math.
- 🛡️ **$0 Operating Cost Stack** — Architected to run 100% within free tiers: Cloudflare Workers, Cloudflare D1 (SQLite), Cloudflare Pages, Turnstile bot protection, and Resend.

---

## Features

- **Equal & Custom Splits**: Split bills equally among all or select participants with 1 tap.
- **Formatted Currency with Thousands Separators**: Crisp, readable number formatting (e.g. `$1,250.00`).
- **Offline Member Support & Seamless Reclaiming**: Add friends who don't have the app yet. Friends can claim their name when joining—and if they clear browser cookies or switch devices, they can reclaim their member slot without lockouts.
- **Platform-Adaptive PWA Install**: 1-tap install on Android & Desktop, simple 2-step browser menu fallback (`⋮` menu on mobile, Share sheet on iOS, Omnibox icon on Desktop) — with zero confusing desktop-only instructions on phones.
- **1-Tap Settle Up**: Clear record of repayments that update balances in real time.
- **Passwordless Account Linking**: Link your email anytime via a password-free magic link delivered via Resend. Seamlessly merges guest groups into your profile.
- **Multi-Layered Edge Security**: Cloudflare WAF rate limiting, Bot Fight Mode, payload size limits, and Cloudflare Turnstile challenge verification.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend PWA** | React 19, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, Lucide Icons, `vite-plugin-pwa` (Workbox) |
| **Backend API** | Cloudflare Workers, Hono, Drizzle ORM, Better Auth, Cloudflare Turnstile verification |
| **Database** | Cloudflare D1 (Serverless SQLite at the edge) |
| **Email Delivery** | Resend (Single-use magic links) |
| **Infrastructure** | OpenTofu (Terraform), Cloudflare Provider v5, GitLab HTTP remote state backend |

---

## Getting Started

### Prerequisites

- **Node.js** `>=24.19.0 <25` (matches `.nvmrc`)
- **pnpm** `11+`
- **OpenTofu** `1.8+` (optional, for infrastructure management)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/felixlheureux/splitwiser.git
   cd splitwiser
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   cp workers/api/.dev.vars.example workers/api/.dev.vars
   ```

4. **Initialize the local D1 database**:
   ```bash
   pnpm db:migrate:local
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1: Run Frontend PWA
   pnpm dev

   # Terminal 2: Run Backend Cloudflare Worker API
   pnpm dev:api
   ```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8787

---

## Project Scripts

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Start dashboard Vite dev server (http://localhost:5173) |
| `pnpm dev:landing` | Start landing page Vite dev server (http://localhost:5174) |
| `pnpm dev:api` | Start backend Hono API with Wrangler local D1 emulator (http://localhost:8787) |
| `pnpm check` | Run linter, typecheck, test suites, and production builds |
| `pnpm test` | Run API integration tests and dashboard unit tests |
| `pnpm build` | Build production bundles for PWA, landing site, and Worker |
| `pnpm db:migrate:local` | Apply D1 schema migrations to local emulator |
| `pnpm db:migrate:remote` | Apply D1 schema migrations to production Cloudflare D1 |
| `pnpm deploy:landing` | Build and deploy landing page to Cloudflare Pages (`splitwiser.app`) |
| `pnpm deploy:dashboard` | Build and deploy PWA dashboard to Cloudflare Pages (`dash.splitwiser.app`) |
| `pnpm deploy:api` | Run remote migrations and deploy API Worker to Cloudflare |
| `pnpm deploy:all` | Build and deploy full stack (API + both Pages apps) |
| `pnpm infra:fmt` | Format OpenTofu infrastructure code |
| `pnpm infra:validate` | Validate OpenTofu infrastructure configuration |

---

## Workspace Layout

```text
splitwiser/
├── apps/
│   ├── dashboard/        # React 19 + Vite PWA frontend (dash.splitwiser.app)
│   └── landing/          # SEO landing page with debt visualizer & FAQ (splitwiser.app)
├── packages/
│   └── shared/           # Shared TypeScript schemas, types, routes, and math
├── workers/
│   └── api/              # Hono REST API on Cloudflare Workers + D1 SQLite
├── infra/
│   └── cloudflare/       # OpenTofu infrastructure (Pages, D1, DNS, WAF, Turnstile)
└── docs/
    └── DEVELOPMENT.md    # Developer setup, conventions, and architectural details
```

---

## Infrastructure ($0/mo Guarantee)

Splitwiser is designed to run completely on **free tiers**:

- **Cloudflare Pages**: Free hosting, unlimited requests, direct git/CLI uploads.
- **Cloudflare Workers**: 100,000 requests/day, sub-3ms execution time.
- **Cloudflare D1**: 5,000,000 reads/day, 100,000 writes/day, 5 GB storage.
- **Cloudflare DNS & Universal SSL**: Free authoritative DNS & auto-renewing edge SSL.
- **Cloudflare Turnstile**: Free bot protection (1M challenges/mo).
- **Resend**: Free tier (3,000 emails/mo, 100/day) for magic link sign-ins.

See [`infra/cloudflare/README.md`](infra/cloudflare/README.md) for OpenTofu configuration and multi-account setup details.

---

## Contributing

Contributions are welcome! Whether it's reporting a bug, improving documentation, or submitting a pull request:

1. Fork the repo and create your branch from `main`.
2. Make your changes and run `pnpm check` to ensure all tests, lints, and builds pass.
3. Open a pull request describing your improvements.

---

## Support

If Splitwiser saved you from an annoying expense-sharing subscription, consider supporting the project:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/felixlheureux)

---

## License

MIT License © 2026 Felix L'Heureux
