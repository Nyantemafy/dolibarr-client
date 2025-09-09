const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');
const productController = require('./ProductController'); 

class BOMsController {
  constructor() {
    this.fetchBomWithComponents = this.fetchBomWithComponents.bind(this);
    this.getBOMWithComponents = this.getBOMWithComponents.bind(this);
  }

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

  async fetchBomWithComponents(bomId) {
    console.log('🔍 fetchBomWithComponents appelée avec bomId:', bomId);
    
    try {
      const bom = await dolibarrService.get(`/boms/${bomId}`);
      
      const bomLines = await dolibarrService.get(`/boms/${bomId}/lines`) || [];
      
      const components = await Promise.all(
        bomLines.map(async (line, index) => {
          const productId = line.fk_product || line.product_id;
          
          if (productId) {
            try {
              const product = await productController.getProductById(productId);
              return { ...line, product };
            } catch (err) {
              console.warn(`❌ Produit ${productId} introuvable:`, err.message);
              return {
                ...line,
                product: { id: productId, ref: `PROD_${productId}`, label: `Produit ${productId}` }
              };
            }
          }
          return line;
        })
      );
      
      return { ...bom, components };
      
    } catch (err) {
      console.error('💥 Erreur dans fetchBomWithComponents:', err);
      return null;
    }
  }

  async getBOMWithComponents(req, res) {
    const { id } = req.params;
    try {
      const bomWithComponents = await this.fetchBomWithComponents(id);
      if (!bomWithComponents) {
        return res.status(404).json({ success: false, error: "BOM introuvable" });
      }

      // Ajouter le produit principal ici, sans toucher à fetchBomWithComponents
      const productId = bomWithComponents.fk_product || bomWithComponents.product_id;
      const product = productId
        ? await productController.getProductById(productId)
        : null;

      res.json({ 
        success: true, 
        data: { 
          ...bomWithComponents, 
          product 
        } 
      });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

}

module.exports = new BOMsController();