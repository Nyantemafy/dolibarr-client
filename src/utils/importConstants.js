export const IMPORT_TYPES = {
  BOM: 'bom',
  PRODUCT: 'product'
};

export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const BOM_COLUMNS = [
  'bom_numero', 'bom_libelle', 'bom_type', 'bom_qte', 'bom_produit', 'bom_composition'
];

export const PRODUCT_COLUMNS = [
  'produit_ref', 'produit_nom', 'produit_type', 'entrepot', 
  'stock_initial', 'valeur_stock_initial', 'prix_vente'
];