environment         = "dev"
location            = "centralindia"
resource_group_name = "rg-homeease-dev"

acr_name    = "acrhomeeasedev"
aks_vm_size = "Standard_D2s_v5"

tags = {
  project     = "homeease"
  environment = "dev"
  managed_by  = "terraform"
}


key_vault_name = "kv-homeease-dev-001"
tenant_id      = "25ea82b6-dfae-45a3-8712-f925d1b3397d"


aks_oidc_issuer_url = "https://centralindia.oic.prod-aks.azure.com/25ea82b6-dfae-45a3-8712-f925d1b3397d/9e776b13-3d4d-4e11-ac68-d243211b92e4/"