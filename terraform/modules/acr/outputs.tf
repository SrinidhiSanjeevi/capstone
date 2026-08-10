output "id" {
  description = "Resource ID of the ACR. Needed by the AKS module for the AcrPull role assignment."
  value       = azurerm_container_registry.this.id
}

output "name" {
  value = azurerm_container_registry.this.name
}

output "login_server" {
  description = "The ACR login server (e.g. acrhomeeasedev.azurecr.io) — used in `docker push`/`docker pull` and in Kubernetes image references."
  value       = azurerm_container_registry.this.login_server
}