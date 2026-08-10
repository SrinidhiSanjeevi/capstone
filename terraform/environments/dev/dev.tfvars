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