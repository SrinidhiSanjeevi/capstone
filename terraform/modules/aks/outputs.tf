output "id" {
  value = azurerm_kubernetes_cluster.this.id
}

output "name" {
  value = azurerm_kubernetes_cluster.this.name
}

output "kube_config_raw" {
  description = "Raw kubeconfig for connecting kubectl to this cluster. Sensitive — do not log or commit."
  value       = azurerm_kubernetes_cluster.this.kube_config_raw
  sensitive   = true
}

output "node_resource_group" {
  description = "The auto-created resource group holding node VMs, disks, load balancers, etc."
  value       = azurerm_kubernetes_cluster.this.node_resource_group
}