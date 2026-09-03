variable "cloudflare_app_api_token" {
  description = "Cloudflare API token for Pages and D1 in the app account."
  type        = string
  sensitive   = true
}

variable "cloudflare_dns_api_token" {
  description = "Cloudflare API token for DNS in the account owning the zone."
  type        = string
  sensitive   = true
}

variable "cloudflare_app_account_id" {
  description = "Cloudflare account ID that owns Splitwiser Pages and D1 resources."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for splitwiser.app."
  type        = string
}

variable "root_domain" {
  description = "Primary Splitwiser domain."
  type        = string
  default     = "splitwiser.app"
}

variable "dashboard_domain" {
  description = "Public hostname for the installed dashboard PWA."
  type        = string
  default     = "dash.splitwiser.app"
}

variable "dashboard_subdomain" {
  description = "DNS label for the dashboard Pages custom domain."
  type        = string
  default     = "dash"
}

variable "dashboard_project_name" {
  description = "Cloudflare Pages Direct Upload project name for the dashboard."
  type        = string
  default     = "splitwiser-dashboard-production"
}

variable "production_branch" {
  description = "Branch label used by the Pages project for production uploads."
  type        = string
  default     = "main"
}

variable "d1_database_name" {
  description = "D1 database name."
  type        = string
  default     = "splitwiser-d1-production"
}

variable "create_landing_project" {
  description = "Provision the future landing Pages project and apex domain."
  type        = bool
  default     = false
}

variable "landing_project_name" {
  description = "Cloudflare Pages Direct Upload project name for the future landing site."
  type        = string
  default     = "splitwiser-landing-production"
}

variable "email_provider_dns_records" {
  description = "Verified Resend DNS records for the splitwiser.app sending domain."
  type = list(object({
    name     = string
    type     = string
    content  = string
    priority = optional(number)
  }))
  default = []
}
