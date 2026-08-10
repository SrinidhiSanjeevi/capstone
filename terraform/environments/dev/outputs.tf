output "resource_group_name" {
  value = module.resource_group.name
}

output "vnet_id" {
  value = module.networking.vnet_id
}

output "vnet_name" {
  value = module.networking.vnet_name
}

output "aks_subnet_id" {
  value = module.networking.aks_subnet_id
}

output "acr_id" {
  value = module.acr.id
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "aks_cluster_name" {
  value = module.aks.name
}

output "aks_node_resource_group" {
  value = module.aks.node_resource_group
}