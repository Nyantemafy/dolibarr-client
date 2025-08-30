const dolibarrService = require('../services/dolibarrService');
const csvService = require('../services/csvService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

class ImportController {
  async importAll(req, res) {
    try {
      const { products, boms } = req.body;

      if (!Array.isArray(products) || products.length === 0 ||
          !Array.isArray(boms) || boms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Products and BOMs must both be provided'
        });
      }

      const results = {
        products: [],
        boms: []
      };

      // ---- Étape 1 : Validation ----
      for (let i = 0; i < products.length; i++) {
        const { error } = validationService.validateProduct(products[i]);
        if (error) throw new Error(`Product line ${i + 1} validation failed: ${error.details[0].message}`);
      }

      for (let i = 0; i < boms.length; i++) {
        const { error } = validationService.validateBOM(boms[i]);
        if (error) throw new Error(`BOM line ${i + 1} validation failed: ${error.details[0].message}`);
      }

      // ---- Étape 2 : Vérification existence produits ----
      for (let i = 0; i < products.length; i++) {
        const value = products[i];
        let existingProduct = null;
        try {
          const response = await dolibarrService.get(`/products?ref=${value.ref}`);
          if (Array.isArray(response) && response.length > 0) {
            existingProduct = response[0];
          }
        } catch (checkError) {
          logger.error(`Error checking existing product ref=${value.ref}:`, checkError);
        }
        if (existingProduct) {
          throw new Error(`Product line ${i + 1} already exists (ref=${value.ref})`);
        }
      }

      // ---- Étape 3 : Création produits ----
      for (let i = 0; i < products.length; i++) {
        const productData = products[i];
        const createdProduct = await dolibarrService.post('/products', productData);

        // Gestion du stock initial
        if (productData.stock_initial && productData.stock_initial > 0) {
          await dolibarrService.post(`/products/${createdProduct.id}/stock/correction`, {
            qty: parseFloat(productData.stock_initial),
            warehouse_id: 1,
            price: parseFloat(productData.valeur_stock_initial) || 0
          });
        }

        results.products.push({ index: i, status: 'success', createdId: createdProduct.id });
      }

      // ---- Étape 4 : Création BOMs ----
      for (let i = 0; i < boms.length; i++) {
        const bomData = boms[i];

        if (bomData.bom_composition) {
          bomData.lines = csvService.parseBOMComposition(bomData.bom_composition);
        }

        const createdBOM = await dolibarrService.post('/boms', bomData);
        results.boms.push({ index: i, status: 'success', createdId: createdBOM.id });
      }

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      logger.error('Import all (products+BOMs) failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ImportController();
