variable "resource_group_name" {
  description = "Resource group containing the HomeEase Azure resources"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "identity_name" {
  description = "Existing user-assigned managed identity name"
  type        = string
}

variable "federated_credential_name" {
  description = "Existing federated identity credential name"
  type        = string
}

variable "aks_oidc_issuer_url" {
  description = "OIDC issuer URL exposed by AKS"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace used by HomeEase"
  type        = string
}

variable "service_account_name" {
  description = "Kubernetes service account used by HomeEase workloads"
  type        = string
}

variable "key_vault_id" {
  description = "Resource ID of the HomeEase Key Vault"
  type        = string
}