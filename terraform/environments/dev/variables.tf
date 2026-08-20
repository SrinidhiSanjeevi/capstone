variable "environment" {
  description = "Environment name — dev, test, or prod."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "centralindia"
}

variable "resource_group_name" {
  description = "Name of the resource group for the application infrastructure (separate from tfstate-rg, which only holds Terraform state)."
  type        = string
  default     = "rg-homeease-dev"
}

variable "tags" {
  description = "Tags applied to all resources in this environment."
  type        = map(string)
  default = {
    project     = "homeease"
    environment = "dev"
    managed_by  = "terraform"
  }
}

variable "acr_name" {
  description = "Name of the Azure Container Registry for this environment. Must be globally unique, alphanumeric only."
  type        = string
  default     = "acrhomeeasedev"
}

variable "aks_cluster_name" {
  description = "Name of the AKS cluster for this environment."
  type        = string
  default     = "aks-homeease-dev"
}

variable "aks_dns_prefix" {
  description = "DNS prefix for the AKS control plane."
  type        = string
  default     = "homeease-dev"
}

variable "aks_vm_size" {
  description = "VM size for the AKS node."
  type        = string
  default     = "Standard_D2s_v5"
}

variable "key_vault_name" {
  description = "Globally unique Azure Key Vault name"
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

