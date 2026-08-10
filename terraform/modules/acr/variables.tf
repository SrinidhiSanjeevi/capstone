variable "name" {
  description = "Name of the Azure Container Registry. Must be globally unique, alphanumeric only (no hyphens), 5-50 chars."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9]{5,50}$", var.name))
    error_message = "ACR name must be 5-50 alphanumeric characters only (no hyphens, underscores, or spaces)."
  }
}

variable "resource_group_name" {
  description = "Resource group to create the ACR in."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "sku" {
  description = "ACR SKU. Basic is sufficient for dev/low-volume use; Standard/Premium needed for geo-replication, private endpoints, or content trust."
  type        = string
  default     = "Basic"

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.sku)
    error_message = "sku must be one of: Basic, Standard, Premium."
  }
}

variable "admin_enabled" {
  description = "Whether to enable the ACR admin account (shared username/password). Kept false by default — use managed identity / RBAC (AcrPull role assignment) instead."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags applied to the ACR."
  type        = map(string)
  default     = {}
}