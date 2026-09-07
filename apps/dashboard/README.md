# Splitwiser dashboard

A small React + Vite PWA. The current UI supports email-link sign-in, a first
display name, group creation/listing, and sign-out. Ledger screens come later.

Run `pnpm dev` from the repository root, alongside `pnpm dev:api`. Copy the root
`.env.example` to `.env`; `VITE_API_BASE_URL` points to the API, normally
`http://localhost:8787` during development. Requests include the API’s session
cookie. No authentication tokens are stored in browser storage.

Enter your email to receive a 6-digit sign-in code. Entering the code
in the dashboard or installed home-screen app verifies it at the API and
signs you in immediately. Expired codes show a message with an option to request
another. Because authentication uses 6-digit codes instead of links, installed
PWAs sign in seamlessly without redirecting to external browser tabs.

For a production build, set `VITE_API_BASE_URL` to the deployed API origin before
running `pnpm --filter dashboard build`. The API must trust the dashboard’s
origin for credentialed requests and authentication redirects.

Checks: `pnpm --filter dashboard lint` and `pnpm --filter dashboard build`.
The build generates the web manifest and a service worker that caches the app
shell. API responses are not cached; group operations currently require a
connection.

## Structure and API usage

React UI lives in `src/components/{auth,profile,groups}`. `App.tsx` composes
those components. `src/features/api` contains HTTP requests, query keys, and
TanStack query/mutation options. `src/hooks/useAPI.ts` exposes that API object:

```tsx
const api = useAPI();
const groups = useQuery(api.groups.list(user.id));
const createGroup = useMutation(api.groups.create(user.id));

// Also available: api.routes.groups and api.keys.groups.list(user.id).
createGroup.mutate({ name: 'Weekend', currencyCode: 'CAD' });
```

API options handle profile cache updates, group invalidation, and sign-out
cleanup. Components do not repeat routes, keys, or request effects. Group keys
include the user ID. `pnpm --filter dashboard test` checks cache behavior.
