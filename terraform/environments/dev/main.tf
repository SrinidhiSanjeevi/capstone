module "resource_group" {
  source = "../../modules/resource-group"

  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "networking" {
  source = "../../modules/networking"

  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  environment         = var.environment
  tags                = var.tags

  # vnet_address_space and aks_subnet_prefix left at module defaults for dev.
  # Override here (or via dev.tfvars) if test/prod need non-overlapping
  # ranges for future VNet peering.
}

module "acr" {
  source = "../../modules/acr"

  name                = var.acr_name
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = var.tags

  # sku and admin_enabled use module defaults (Basic, admin disabled)
}

module "aks" {
  source = "../../modules/aks"

  name                = var.aks_cluster_name
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  dns_prefix          = var.aks_dns_prefix
  subnet_id           = module.networking.aks_subnet_id
  acr_id              = module.acr.id
  vm_size             = var.aks_vm_size
  tags                = var.tags
}

module "keyvault" {
  source = "../../modules/keyvault"

  name                = var.key_vault_name
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  tenant_id           = var.tenant_id

  tags = {
    project     = "homeease"
    environment = "dev"
    managed_by  = "terraform"
  }

  depends_on = [module.resource_group]
}


module "workload_identity" {
  source = "../../modules/workload-identity"

  resource_group_name = var.resource_group_name
  location            = var.location

  identity_name             = "homeease-workload-identity"
  federated_credential_name = "homeease-aks-federation"

  aks_oidc_issuer_url = var.aks_oidc_issuer_url

  namespace            = "homeease"
  service_account_name = "homeease-workload-sa"

  key_vault_id = module.keyvault.id
}