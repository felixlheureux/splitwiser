# Splitwiser Cloudflare infrastructure

This directory is managed with **OpenTofu exclusively**. GitHub hosts the
source repository, while GitLab stores only the remote OpenTofu state. OpenTofu
owns long-lived Cloudflare resources; Wrangler owns Worker deployment, Pages
uploads, secrets, and D1 migrations.

All provisioned resources follow `splitwiser-RESOURCE-production`: the
dashboard Pages project is `splitwiser-dashboard-production`, the future
landing project is `splitwiser-landing-production`, and the D1 database is
`splitwiser-d1-production`. Workspace package names remain shorter.

## Local use

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with real account, zone, and token values.
tofu init -backend=false
tofu fmt
tofu validate
tofu plan -refresh=false
```

Never commit `terraform.tfvars`, state, plans, or backend credentials. Local
validation uses `-backend=false`; it must not create or use production state.

## GitLab state

The operator initializes the empty HTTP backend in `backend.tf` with GitLab's
OpenTofu state API, using the state name `splitwiser-production`:

```text
${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/terraform/state/splitwiser-production
```

For manual operations, use a GitLab project or personal access token with API
access in the operator's shell environment. Do not commit the token. Configure
these shell variables before running a plan:

```bash
export TF_HTTP_ADDRESS="https://gitlab.com/api/v4/projects/<project-id>/terraform/state/splitwiser-production"
export TF_HTTP_LOCK_ADDRESS="$TF_HTTP_ADDRESS/lock"
export TF_HTTP_UNLOCK_ADDRESS="$TF_HTTP_ADDRESS/lock"
export TF_HTTP_USERNAME="<gitlab-username-or-token-name>"
export TF_HTTP_PASSWORD="<gitlab-api-token>"
export TF_HTTP_LOCK_METHOD=POST
export TF_HTTP_UNLOCK_METHOD=DELETE
```

Cloudflare values are supplied through the root `.env` inventory as `TF_VAR_*`
shell variables, or separately through `terraform.tfvars`:

- `TF_VAR_cloudflare_app_api_token` for Pages, D1, and Turnstile in the app account
- `TF_VAR_cloudflare_dns_api_token` for DNS in the domain account
- `TF_VAR_cloudflare_app_account_id` for the account containing Pages and D1
- `TF_VAR_cloudflare_zone_id` for the `splitwiser.app` zone in the other account

The app token needs Pages Edit, D1 Edit, and Turnstile Edit in the app account. The DNS token
needs DNS Edit and Zone Read for the separate account that owns
`splitwiser.app`. Use the exact Resend records for the verified
`splitwiser.app` sending domain; no separate sending host is required.

All deployments are manual. Review the plan before running `tofu apply`; the
GitLab HTTP lock serializes concurrent OpenTofu operations.

The future landing Pages project is disabled by default with
`create_landing_project = false` until `apps/landing` is implemented.
