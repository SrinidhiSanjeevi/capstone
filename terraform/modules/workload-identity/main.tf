# ============================================================
# HomeEase AKS Workload Identity
# ============================================================
#
# These Azure resources already exist.
# Terraform will import them into its state and manage them.
# ============================================================

resource "azurerm_user_assigned_identity" "homeease" {
  name                = var.identity_name
  resource_group_name = var.resource_group_name
  location            = var.location
}

resource "azurerm_federated_identity_credential" "homeease" {
  name                = var.federated_credential_name
  resource_group_name = var.resource_group_name

  # AzureRM 3.x uses parent_id.
  parent_id = azurerm_user_assigned_identity.homeease.id

  issuer = var.aks_oidc_issuer_url

  subject = "system:serviceaccount:${var.namespace}:${var.service_account_name}"

  audience = [
    "api://AzureADTokenExchange"
  ]
}

resource "azurerm_role_assignment" "keyvault_secrets_user" {
  scope                = var.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.homeease.principal_id
}