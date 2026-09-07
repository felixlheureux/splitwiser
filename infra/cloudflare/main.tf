resource "cloudflare_pages_project" "dashboard" {
  provider          = cloudflare.app
  account_id        = var.cloudflare_app_account_id
  name              = var.dashboard_project_name
  production_branch = var.production_branch
}

resource "cloudflare_pages_project" "landing" {
  provider          = cloudflare.app
  count             = var.create_landing_project ? 1 : 0
  account_id        = var.cloudflare_app_account_id
  name              = var.landing_project_name
  production_branch = var.production_branch
}

resource "cloudflare_pages_domain" "dashboard" {
  provider     = cloudflare.app
  account_id   = var.cloudflare_app_account_id
  project_name = cloudflare_pages_project.dashboard.name
  name         = var.dashboard_domain
}

resource "cloudflare_pages_domain" "landing" {
  provider     = cloudflare.app
  count        = var.create_landing_project ? 1 : 0
  account_id   = var.cloudflare_app_account_id
  project_name = cloudflare_pages_project.landing[0].name
  name         = var.root_domain
}

resource "cloudflare_d1_database" "app" {
  provider   = cloudflare.app
  account_id = var.cloudflare_app_account_id
  name       = var.d1_database_name

  lifecycle {
    ignore_changes = [read_replication]
  }
}


resource "cloudflare_dns_record" "dashboard" {
  provider = cloudflare.dns
  zone_id  = var.cloudflare_zone_id
  name     = var.dashboard_subdomain
  type     = "CNAME"
  content  = cloudflare_pages_project.dashboard.subdomain
  ttl      = 1
  proxied  = true
}

resource "cloudflare_dns_record" "landing" {
  provider = cloudflare.dns
  count    = var.create_landing_project ? 1 : 0
  zone_id  = var.cloudflare_zone_id
  name     = var.root_domain
  type     = "CNAME"
  content  = cloudflare_pages_project.landing[0].subdomain
  ttl      = 1
  proxied  = true
}

resource "cloudflare_dns_record" "email_provider" {
  provider = cloudflare.dns
  for_each = {
    for record in var.email_provider_dns_records : "${record.type}:${record.name}" => record
  }

  zone_id  = var.cloudflare_zone_id
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  priority = each.value.priority
  ttl      = 1
  proxied  = false
}



