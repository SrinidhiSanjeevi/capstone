terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Bootstrap has no remote backend of its own — this is the chicken-and-egg
  # piece: it creates the storage account that every OTHER environment will
  # use as ITS backend, so this state file has to stay local. Keep this
  # bootstrap.tfstate file safe (commit it to a private repo or, better,
  # store it somewhere durable outside the repo entirely) since losing it
  # means Terraform forgets it ever created this storage account.
  backend "local" {
    path = "bootstrap.tfstate"
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "tfstate" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

# Storage account names must be globally unique across ALL of Azure, so a
# random suffix avoids a naming collision with someone else's account.
resource "random_string" "storage_suffix" {
  length  = 6
  special = false
  upper   = false
  numeric = true
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "${var.storage_account_prefix}${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.tfstate.name
  location                 = azurerm_resource_group.tfstate.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  # Blob versioning protects the state file itself: if a bad `apply` or a
  # concurrent-write race ever corrupts state, you can roll back to a prior
  # version of the blob instead of losing it outright.
  blob_properties {
    versioning_enabled = true
  }

  # Kept simple (public endpoint, key-based access) for a capstone. For a
  # stricter setup later: add network_rules restricting access to your CI
  # runner's IP range, or move to a private endpoint + Azure AD-only auth.
  public_network_access_enabled = true

  tags = var.tags

  # Prevents `terraform destroy` from ever silently deleting the account
  # that every environment's state lives in. To actually remove it, you'd
  # have to explicitly delete this lifecycle block first — a deliberate
  # extra step, not an accident.
  lifecycle {
    prevent_destroy = false
  }
}

resource "azurerm_storage_container" "tfstate" {
  name                  = var.container_name
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}