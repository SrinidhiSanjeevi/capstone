variable "resource_group_name" {
  description = "Resource group that holds the Terraform state storage account."
  type        = string
  default     = "tfstate-rg"
}

variable "location" {
  description = "Azure region for the state storage account."
  type        = string
  default     = "centralindia"
}

variable "storage_account_prefix" {
  description = "Prefix for the storage account name. A random 6-char suffix is appended since storage account names must be globally unique across all of Azure."
  type        = string
  default     = "tfstatehomeease"

  validation {
    condition     = length(var.storage_account_prefix) <= 18
    error_message = "storage_account_prefix must be 18 characters or fewer so prefix + 6-char random suffix stays within Azure's 24-character storage account name limit."
  }
}

variable "container_name" {
  description = "Blob container that will hold the .tfstate files for every environment (dev/test/prod)."
  type        = string
  default     = "tfstate"
}

variable "tags" {
  description = "Tags applied to all bootstrap resources."
  type        = map(string)
  default = {
    project    = "homeease"
    purpose    = "terraform-state"
    managed_by = "terraform-bootstrap"
  }
}