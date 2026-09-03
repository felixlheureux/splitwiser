provider "cloudflare" {
  alias     = "app"
  api_token = var.cloudflare_app_api_token
}

provider "cloudflare" {
  alias     = "dns"
  api_token = var.cloudflare_dns_api_token
}
