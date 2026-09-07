output "dashboard_pages_project_name" {
  description = "Dashboard Pages project name for Wrangler Direct Upload."
  value       = cloudflare_pages_project.dashboard.name
}

output "dashboard_pages_subdomain" {
  description = "Cloudflare Pages preview subdomain for the dashboard."
  value       = cloudflare_pages_project.dashboard.subdomain
}

output "dashboard_domain" {
  description = "Dashboard custom domain."
  value       = cloudflare_pages_domain.dashboard.name
}

output "d1_database_id" {
  description = "D1 database ID to place in the API Wrangler configuration."
  value       = cloudflare_d1_database.app.id
}

output "landing_pages_project_name" {
  description = "Future landing Pages project name, when enabled."
  value       = var.create_landing_project ? cloudflare_pages_project.landing[0].name : null
}
