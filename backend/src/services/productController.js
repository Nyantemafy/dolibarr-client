const dolibarrService = require('../services/dolibarrService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

class ProductController {
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      
      let endpoint = `/products?page=${page}&limit=${limit}`;
      if (search) {
        endpoint += `&sqlfilters=(t.ref:like:'%${search}%') OR (t.label:like:'%${search}%')`;
      }

      const products = await dolibarrService.get(endpoint);
      
      res.json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: products.length
        }
      });
    } catch (error) {
      logger.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      // Validation
      const { error, value } = validationService.validateProduct(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const product = await dolibarrService.post('/products', value);
      
      logger.info(`Product created: ${product.id}`);
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      
      const { error, value } = validationService.validateProduct(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      const product = await dolibarrService.put(`/products/${id}`, value);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      await dolibarrService.delete(`/products/${id}`);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();