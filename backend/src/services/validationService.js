const Joi = require('joi');
const dolibarrService = require('./dolibarrService');
const logger = require('../utils/logger');

// Vos schémas existants
const productSchema = Joi.object({
  ref: Joi.string().required().messages({
    'string.empty': 'La référence produit est obligatoire',
    'any.required': 'La référence produit est obligatoire'
  }),
  label: Joi.string().required().messages({
    'string.empty': 'Le nom du produit est obligatoire',
    'any.required': 'Le nom du produit est obligatoire'
  }),
  entrepot: Joi.string().required().messages({
    'string.empty': 'Le entrepot du produit est obligatoire',
    'any.required': 'Le entrepot du produit est obligatoire'
  }),
  type: Joi.number().valid(0, 1).default(0),
  status: Joi.number().valid(0, 1).default(1),
  status_buy: Joi.number().valid(0, 1).default(1),
  status_sell: Joi.number().valid(0, 1).default(1),
  price: Joi.number().min(0).optional(),
  stock_initial: Joi.number().min(0).optional(),
  valeur_stock_initial: Joi.number().min(0).optional()
});

const bomSchema = Joi.object({
  ref: Joi.string().required().messages({
    'string.empty': 'La référence BOM est obligatoire',
    'any.required': 'La référence BOM est obligatoire'
  }),
  label: Joi.string().required().messages({
    'string.empty': 'Le libellé BOM est obligatoire',
    'any.required': 'Le libellé BOM est obligatoire'
  }),
  bomtype: Joi.number().valid(0, 1).default(0),
  qty: Joi.number().min(1).default(1),
  status: Joi.number().valid(0, 1).default(1),
  bom_produit: Joi.string().optional(), 
  fk_product: Joi.alternatives().try(
    Joi.string(),
    Joi.number()
  ).optional(),
  lines: Joi.array().items(
    Joi.object({
      fk_product: Joi.alternatives().try(
        Joi.string().required(),
        Joi.number().required()
      ),
      qty: Joi.number().min(0).required()
    })
  ).optional()
});

class ValidationService {
  // Vos méthodes existantes
  validateProduct(data) {
    return productSchema.validate(data, { abortEarly: false });
  }

  validateBOM(data) {
    return bomSchema.validate(data, { abortEarly: false });
  }

  // NOUVELLE MÉTHODE : Validation complète pour l'aperçu
  async validateImportData(products, boms) {
    const results = {
      products: [],
      boms: [],
      duplicates: {
        products: [],
        boms: [],
        internal: {
          products: [],
          boms: []
        }
      },
      summary: {
        totalProducts: products.length,
        totalBoms: boms.length,
        validProducts: 0,
        validBoms: 0,
        hasErrors: false,
        hasWarnings: false
      }
    };

    try {
      // Récupérer les données existantes de Dolibarr
      const [existingProducts, existingBOMs, existingWarehouses] = await Promise.all([
        dolibarrService.get('/products').catch(() => []),
        dolibarrService.get('/boms').catch(() => []),
        dolibarrService.get('/warehouses').catch(() => [])
      ]);

      const existingProductRefs = existingProducts.map(p => p.ref?.trim().toLowerCase()).filter(Boolean);
      const existingBOMRefs = existingBOMs.map(b => b.ref?.trim().toLowerCase()).filter(Boolean);
      const existingWarehouseRefs = existingWarehouses.map(w => w.ref?.trim().toLowerCase()).filter(Boolean);

      // Validation des produits
      await this.validateProductsList(products, results, existingProductRefs, existingWarehouseRefs);

      // Validation des BOMs
      await this.validateBOMsList(boms, results, existingBOMRefs, products);

      // Calcul du résumé final
      results.summary.hasErrors = 
        results.summary.validProducts < results.summary.totalProducts ||
        results.summary.validBoms < results.summary.totalBoms;

      return results;

    } catch (error) {
      logger.error('Validation complète échouée:', error);
      throw new Error(`Erreur lors de la validation: ${error.message}`);
    }
  }

  // Validation de la liste des produits
  async validateProductsList(products, results, existingProductRefs, existingWarehouseRefs) {
    const productRefsInFile = new Set();

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productResult = {
        line: i + 1,
        ref: product.ref,
        label: product.label,
        isValid: true,
        errors: [],
        warnings: []
      };

      // 1. Validation du schéma Joi
      const { error: schemaError } = this.validateProduct(product);
      if (schemaError) {
        productResult.isValid = false;
        schemaError.details.forEach(detail => {
          productResult.errors.push(detail.message);
        });
      }

      // 2. Vérification des doublons avec l'existant
      const productRefLower = product.ref?.trim().toLowerCase();
      if (productRefLower && existingProductRefs.includes(productRefLower)) {
        productResult.isValid = false;
        productResult.errors.push('Produit existe déjà dans le système');
        results.duplicates.products.push(product.ref);
      }

      // 3. Vérification des doublons internes au fichier
      if (productRefLower && productRefsInFile.has(productRefLower)) {
        productResult.isValid = false;
        productResult.errors.push('Référence dupliquée dans le fichier d\'import');
        results.duplicates.internal.products.push(product.ref);
      } else if (productRefLower) {
        productRefsInFile.add(productRefLower);
      }

      // 4. Validations métier spécifiques
      this.validateProductBusiness(product, productResult, existingWarehouseRefs);

      // Mise à jour des compteurs
      if (productResult.isValid) {
        results.summary.validProducts++;
      }
      if (productResult.warnings.length > 0) {
        results.summary.hasWarnings = true;
      }

      results.products.push(productResult);
    }
  }

  // Validation de la liste des BOMs
  async validateBOMsList(boms, results, existingBOMRefs, products) {
    const bomRefsInFile = new Set();
    const productRefsInFile = new Set(products.map(p => p.ref?.trim().toLowerCase()).filter(Boolean));

    for (let i = 0; i < boms.length; i++) {
      const bom = boms[i];
      const bomResult = {
        line: i + 1,
        ref: bom.ref,
        label: bom.label,
        finishedProduct: bom.bom_produit || bom.fk_product,
        componentsCount: bom.lines?.length || 0,
        isValid: true,
        errors: [],
        warnings: []
      };

      // 1. Validation du schéma Joi
      const { error: schemaError } = this.validateBOM(bom);
      if (schemaError) {
        bomResult.isValid = false;
        schemaError.details.forEach(detail => {
          bomResult.errors.push(detail.message);
        });
      }

      // 2. Vérification des doublons avec l'existant
      const bomRefLower = bom.ref?.trim().toLowerCase();
      if (bomRefLower && existingBOMRefs.includes(bomRefLower)) {
        bomResult.isValid = false;
        bomResult.errors.push('BOM existe déjà dans le système');
        results.duplicates.boms.push(bom.ref);
      }

      // 3. Vérification des doublons internes au fichier
      if (bomRefLower && bomRefsInFile.has(bomRefLower)) {
        bomResult.isValid = false;
        bomResult.errors.push('Référence dupliquée dans le fichier d\'import');
        results.duplicates.internal.boms.push(bom.ref);
      } else if (bomRefLower) {
        bomRefsInFile.add(bomRefLower);
      }

      // 4. Validations métier spécifiques
      this.validateBOMBusiness(bom, bomResult, productRefsInFile);

      // Mise à jour des compteurs
      if (bomResult.isValid) {
        results.summary.validBoms++;
      }
      if (bomResult.warnings.length > 0) {
        results.summary.hasWarnings = true;
      }

      results.boms.push(bomResult);
    }
  }

  // Validations métier pour les produits
  validateProductBusiness(product, result, existingWarehouseRefs) {
    const initialStock = parseFloat(product.stock_initial) || 0;
    const initialPrice = parseFloat(product.valeur_stock_initial) || 0;

    // Validation stock/entrepôt
    if (initialStock > 0) {
      if (!product.entrepot) {
        result.isValid = false;
        result.errors.push('Stock initial défini mais aucun entrepôt spécifié');
      } else {
        const warehouseRefLower = product.entrepot.trim().toLowerCase();
        if (!existingWarehouseRefs.includes(warehouseRefLower)) {
          result.warnings.push(`Entrepôt "${product.entrepot}" sera créé automatiquement`);
        }
      }

      // Validation prix avec stock
      if (initialStock > 0 && initialPrice <= 0) {
        result.warnings.push('Stock initial sans valeur : prix unitaire sera 0');
      }
    }

    // Validation cohérence prix/type
    if (product.type === 1 && initialStock > 0) { // Service avec stock
      result.warnings.push('Un service ne devrait pas avoir de stock initial');
    }

    // Validation format référence
    if (product.ref && !/^[A-Za-z0-9_-]+$/.test(product.ref)) {
      result.isValid = false;
      result.errors.push('Référence contient des caractères non autorisés');
    }
  }

  // Validations métier pour les BOMs
  validateBOMBusiness(bom, result, productRefsInFile) {
    const finishedRef = (bom.bom_produit || bom.fk_product)?.trim().toLowerCase();
    
    // Vérification du produit fini
    if (!finishedRef) {
      result.isValid = false;
      result.errors.push('Aucun produit fini spécifié');
      return;
    }

    // Le produit fini doit être dans la liste des produits à importer
    if (!productRefsInFile.has(finishedRef)) {
      result.isValid = false;
      result.errors.push(`Produit fini "${bom.bom_produit || bom.fk_product}" introuvable dans la liste des produits`);
    }

    // Validation des composants
    if (!bom.lines || bom.lines.length === 0) {
      result.warnings.push('BOM sans composants');
      return;
    }

    const componentRefs = new Set();
    bom.lines.forEach((line, lineIndex) => {
      const componentRef = line.fk_product?.trim().toLowerCase();
      
      if (!componentRef) {
        result.isValid = false;
        result.errors.push(`Ligne ${lineIndex + 1}: Référence composant manquante`);
        return;
      }

      // Vérification doublon composants dans le BOM
      if (componentRefs.has(componentRef)) {
        result.warnings.push(`Ligne ${lineIndex + 1}: Composant "${line.fk_product}" dupliqué dans ce BOM`);
      } else {
        componentRefs.add(componentRef);
      }

      // Le composant doit être dans la liste des produits à importer
      if (!productRefsInFile.has(componentRef)) {
        result.isValid = false;
        result.errors.push(`Ligne ${lineIndex + 1}: Composant "${line.fk_product}" introuvable dans la liste des produits`);
      }

      // Validation quantité
      if (!line.qty || line.qty <= 0) {
        result.isValid = false;
        result.errors.push(`Ligne ${lineIndex + 1}: Quantité invalide pour "${line.fk_product}"`);
      }

      // Détection référence circulaire
      if (componentRef === finishedRef) {
        result.isValid = false;
        result.errors.push(`Ligne ${lineIndex + 1}: Référence circulaire détectée`);
      }
    });

    // Validation quantité BOM
    if (bom.qty && bom.qty <= 0) {
      result.isValid = false;
      result.errors.push('Quantité du BOM doit être supérieure à 0');
    }
  }
}

module.exports = new ValidationService();