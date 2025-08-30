const dolibarrService = require('../services/dolibarrService');
const csvService = require('../services/csvService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

class ImportController {
  async importProducts(req, res) {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No products provided'
        });
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < products.length; i++) {
        const productData = products[i];
        const result = {
          index: i,
          originalData: productData,
          status: 'processing'
        };

        try {
          // Validation
          const { error, value } = validationService.validateProduct(productData);
          if (error) {
            throw new Error(error.details[0].message);
          }

          // Création du produit
          const createdProduct = await dolibarrService.post('/products', value);
          
          result.status = 'success';
          result.createdId = createdProduct.id || createdProduct;
          successCount++;

          // Gestion du stock initial
          if (productData.stock_initial && productData.stock_initial > 0) {
            try {
              await dolibarrService.post(`/products/${result.createdId}/stock/correction`, {
                qty: parseFloat(productData.stock_initial),
                warehouse_id: 1,
                price: parseFloat(productData.valeur_stock_initial) || 0
              });
            } catch (stockError) {
              result.status = 'warning';
              result.error = `Product created but stock error: ${stockError.message}`;
            }
          }

        } catch (error) {
          result.status = 'error';
          result.error = error.message;
          errorCount++;
          logger.error(`Product import error line ${i + 1}:`, error);
        }

        results.push(result);
      }

      res.json({
        success: true,
        data: {
          results,
          summary: {
            total: products.length,
            success: successCount,
            errors: errorCount
          }
        }
      });

    } catch (error) {
      logger.error('Import products error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async importBOMs(req, res) {
    try {
      const { boms } = req.body;
      
      if (!Array.isArray(boms) || boms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No BOMs provided'
        });
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < boms.length; i++) {
        const bomData = boms[i];
        const result = {
          index: i,
          originalData: bomData,
          status: 'processing'
        };

        try {
          // Validation
          const { error, value } = validationService.validateBOM(bomData);
          if (error) {
            throw new Error(error.details[0].message);
          }

          // Parser la composition
          if (bomData.bom_composition) {
            value.lines = csvService.parseBOMComposition(bomData.bom_composition);
          }

          // Création de la BOM
          const createdBOM = await dolibarrService.post('/boms', value);
          
          result.status = 'success';
          result.createdId = createdBOM.id || createdBOM;
          successCount++;

        } catch (error) {
          result.status = 'error';
          result.error = error.message;
          errorCount++;
          logger.error(`BOM import error line ${i + 1}:`, error);
        }

        results.push(result);
      }

      res.json({
        success: true,
        data: {
          results,
          summary: {
            total: boms.length,
            success: successCount,
            errors: errorCount
          }
        }
      });

    } catch (error) {
      logger.error('Import BOMs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ImportController();
