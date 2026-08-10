variable "resource_group_name" {
  description = "Resource group to create networking resources in."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "environment" {
  description = "Environment name (dev/test/prod) — used in resource naming."
  type        = string
}

variable "vnet_address_space" {
  description = "Address space for the virtual network."
  type        = list(string)
  default     = ["10.10.0.0/16"]
}

variable "aks_subnet_prefix" {
  description = "Address prefix for the AKS subnet."
  type        = list(string)
  default     = ["10.10.0.0/22"]
}

variable "tags" {
  description = "Tags applied to all networking resources."
  type        = map(string)
  default     = {}
}