variable "name" {
  description = "Name of the AKS cluster."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group to create the AKS cluster in."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix for the AKS control plane endpoint."
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet AKS nodes will be deployed into (from the networking module)."
  type        = string
}

variable "acr_id" {
  description = "Resource ID of the ACR the cluster should be granted AcrPull on (from the acr module)."
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version. Leave null to let Azure pick the current default supported version."
  type        = string
  default     = null
}

variable "sku_tier" {
  description = "AKS control plane pricing tier. Free = no SLA, no cost (dev/capstone). Standard = paid, adds uptime SLA (production)."
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "sku_tier must be Free or Standard."
  }
}

variable "node_count" {
  description = "Number of nodes in the default node pool."
  type        = number
  default     = 1
}

variable "vm_size" {
  description = "VM size for the AKS node."
  type        = string
  default     = "Standard_D2s_v5"
}

variable "tags" {
  description = "Tags applied to the AKS cluster."
  type        = map(string)
  default     = {}
}