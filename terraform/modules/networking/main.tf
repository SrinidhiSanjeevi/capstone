resource "azurerm_virtual_network" "this" {
  name                = "vnet-homeease-${var.environment}"
  address_space       = var.vnet_address_space
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

# Dedicated subnet for AKS.
#
# No custom NSG is attached here on purpose.
# AKS manages its own NSG for node NICs, but does NOT manage
# a custom NSG attached to this subnet.
#
# A restrictive subnet-level NSG could silently block traffic
# required by AKS, so an NSG will only be added later if there
# is a concrete security requirement.

resource "azurerm_subnet" "aks" {
  name                 = "snet-aks-${var.environment}"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = var.aks_subnet_prefix
}