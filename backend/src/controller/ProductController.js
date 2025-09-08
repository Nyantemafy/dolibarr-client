const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class ProductController {
    async getProductById(productId) {
        if (!productId) return null;
        try {
            return await dolibarrService.get(`/products/${productId}`);
        } catch (err) {
            logger.warn(`Impossible de récupérer le produit ${productId}: ${err.message}`);
            return null;
        }
    }

    async getAllProduct(req, res) {
        try {
          const products = await dolibarrService.get('/products');
          
          if (!Array.isArray(products)) {
            return res.json({ success: true, data: [] });
          }
    
          res.json({
            success: true,
            data: products
          });
    
        } catch (error) {
          logger.error('Error fetching products:', error);
          res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des products',
            details: error.message
          });
        }
    }
}

module.exports = new ProductController();