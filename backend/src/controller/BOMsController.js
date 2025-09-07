const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class BOMsController {
  async getBOMs(req, res) {
    try {
      logger.info('Récupération de la liste des BOM');
      
      const boms = await dolibarrService.get('/boms');
      
      if (!Array.isArray(boms)) {
        throw new Error('Format de réponse BOM invalide');
      }

      const enrichedBoms = await Promise.all(
        boms.map(async (bom) => {
          try {
            // Récupération des détails du produit parent
            const product = await dolibarrService.get(`/products/${bom.fk_product}`);
            
            // Récupération des lignes de nomenclature
            const bomLines = await dolibarrService.get(`/boms/${bom.id}/lines`) || [];
            
            return {
              id: bom.id,
              ref: bom.ref,
              label: bom.label || bom.title,
              product_id: bom.fk_product,
              product_ref: product.ref,
              product_label: product.label,
              qty: parseFloat(bom.qty) || 1,
              status: bom.status,
              lines: bomLines.map(line => ({
                product_id: line.fk_product,
                qty: parseFloat(line.qty) || 0,
                efficiency: parseFloat(line.efficiency) || 100
              }))
            };
          } catch (error) {
            logger.warn(`Erreur enrichissement BOM ${bom.id}:`, error.message);
            return {
              id: bom.id,
              ref: bom.ref,
              label: bom.label || bom.title,
              product_id: bom.fk_product,
              product_ref: 'N/A',
              product_label: 'Erreur chargement',
              qty: parseFloat(bom.qty) || 1,
              status: bom.status,
              lines: []
            };
          }
        })
      );

      res.json({
        success: true,
        data: enrichedBoms
      });

    } catch (error) {
      logger.error('Erreur récupération liste BOM:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des BOM',
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