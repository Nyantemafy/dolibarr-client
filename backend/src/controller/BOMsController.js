const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class BOMsController {
  async getBOMs(req, res) {
    try {
      logger.info('Fetching BOMs from Dolibarr');
      const boms = await dolibarrService.get('/boms');
      res.json({
        success: true,
        data: Array.isArray(boms) ? boms : []
      });
    
    } catch (error) {
      logger.error('Error fetching BOMs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des BOMs',
        details: error.message
      });
    }
  }

  async getBOMDetails(req, res) {
    try {
      const { id } = req.params;
      
      logger.info(`Fetching BOM details for ID: ${id}`);
      
      const bom = await dolibarrService.get(`/boms/${id}`);
      
      try {
        const lines = await dolibarrService.get(`/boms/${id}/lines`);
        bom.lines = lines;
      } catch (error) {
        logger.warn(`Could not fetch BOM lines for BOM ${id}:`, error.message);
        bom.lines = [];
      }

      if (bom.fk_product) {
        try {
          const product = await dolibarrService.get(`/products/${bom.fk_product}`);
          bom.product = product;
        } catch (error) {
          logger.warn(`Could not fetch product details for BOM ${id}:`, error.message);
        }
      }

      res.json(bom);
      
    } catch (error) {
      logger.error(`Error fetching BOM details for ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des détails de la BOM',
        details: error.message
      });
    }
  }

}

module.exports = new BOMsController();