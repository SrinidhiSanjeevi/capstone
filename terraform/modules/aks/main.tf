resource "azurerm_kubernetes_cluster" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  dns_prefix          = var.dns_prefix
  kubernetes_version  = var.kubernetes_version

  # Free tier: no uptime SLA, no control-plane cost.
  # Correct for dev/capstone.
  sku_tier = var.sku_tier

 # Existing AKS cluster already has OIDC enabled.
oidc_issuer_enabled = true

# Enable Azure Workload Identity for Kubernetes service accounts.
workload_identity_enabled = true

# System-assigned managed identity.
identity {
  type = "SystemAssigned"
}

  default_node_pool {
    name                        = "system"
    node_count                  = var.node_count
    vm_size                     = var.vm_size
    vnet_subnet_id              = var.subnet_id
    temporary_name_for_rotation = "systemtmp"

    upgrade_settings {
      drain_timeout_in_minutes      = 0
      max_surge                     = "10%"
      node_soak_duration_in_minutes = 0
    }
  }

  network_profile {
    network_plugin      = "azure"
    network_plugin_mode = "overlay"
    network_policy      = "azure"
  }

  role_based_access_control_enabled = true

  tags = var.tags
}

# Allow AKS kubelet identity to pull images from ACR.
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.this.kubelet_identity[0].object_id
}
