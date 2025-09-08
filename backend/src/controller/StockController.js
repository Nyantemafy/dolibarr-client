const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class StockController {
  
  async getStockList(req, res) {
    try {
      logger.info('Récupération de la liste des stocks');
      
      // Récupération de tous les produits
      const products = await dolibarrService.get('/products');
      
      if (!Array.isArray(products)) {
        throw new Error('Format de réponse produits invalide');
      }

      // Traitement de chaque produit pour calculer les stocks
      const stockData = await Promise.all(
        products.map(async (product) => {
          try {
            const productId = product.id || product.rowid;
            
            // Récupération du stock actuel
            let currentStock = 0;
            let stockValue = 0;
            
            try {
              const stockInfo = await dolibarrService.get(`/products/${productId}/stock`);
              if (Array.isArray(stockInfo) && stockInfo.length > 0) {
                // Somme des stocks dans tous les entrepôts
                currentStock = stockInfo.reduce((total, warehouse) => {
                  return total + (parseFloat(warehouse.qty) || 0);
                }, 0);
                
                // Calcul de la valeur moyenne
                stockValue = stockInfo.reduce((total, warehouse) => {
                  return total + ((parseFloat(warehouse.qty) || 0) * (parseFloat(warehouse.pmp) || 0));
                }, 0);
              }
            } catch (stockError) {
              logger.warn(`Erreur récupération stock produit ${productId}:`, stockError.message);
            }

            // Récupération des mouvements de stock
            let movements = [];
            let stockInitial = 0;
            let totalMovements = 0;
            
            try {
              movements = await dolibarrService.get(`/stockmovements?product_id=${productId}`) || [];
              
              if (Array.isArray(movements)) {
                // Tri par date pour trouver le stock initial
                movements.sort((a, b) => new Date(a.datem) - new Date(b.datem));
                
                // Calcul du stock initial (premier mouvement ou 0)
                if (movements.length > 0) {
                  const firstMovement = movements[0];
                  stockInitial = parseFloat(firstMovement.qty) || 0;
                  
                  // Somme de tous les mouvements pour vérification
                  totalMovements = movements.reduce((total, mov) => {
                    return total + (parseFloat(mov.qty) || 0);
                  }, 0);
                } else {
                  // Pas de mouvements, le stock initial est le stock actuel
                  stockInitial = currentStock;
                }
              }
            } catch (movError) {
              logger.warn(`Erreur récupération mouvements produit ${productId}:`, movError.message);
            }

            // Calcul du stock final (doit correspondre au stock actuel)
            const stockFinal = currentStock;

            return {
              id: productId,
              product_ref: product.ref || 'N/A',
              product_label: product.label || 'N/A',
              stock_initial: stockInitial,
              total_movements: totalMovements - stockInitial, // Mouvements nets après stock initial
              stock_final: stockFinal,
              valeur_unitaire: parseFloat(product.price) || 0,
              valeur_stock: stockValue,
              warehouse_details: [], // À remplir si nécessaire
              last_movement_date: movements.length > 0 ? movements[movements.length - 1].datem : null
            };

          } catch (error) {
            logger.warn(`Erreur traitement produit ${product.id}:`, error.message);
            return {
              id: product.id || product.rowid,
              product_ref: product.ref || 'Erreur',
              product_label: product.label || 'Erreur chargement',
              stock_initial: 0,
              total_movements: 0,
              stock_final: 0,
              valeur_unitaire: 0,
              valeur_stock: 0,
              warehouse_details: [],
              last_movement_date: null
            };
          }
        })
      );

      res.json({
        success: true,
        data: stockData
      });

    } catch (error) {
      logger.error('Erreur récupération liste des stocks:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des stocks',
        details: error.message
      });
    }
  }

  async getProductMovements(req, res) {
    try {
      const { productId } = req.params;
      logger.info(`Récupération mouvements stock produit ${productId}`);

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'ID produit requis'
        });
      }

      // Récupération des mouvements
      const movements = await dolibarrService.get(`/stockmovements?product_id=${productId}`) || [];
      console.log('🔍 fetchmovements:', movements);

      // Enrichissement des mouvements avec détails supplémentaires
      const enrichedMovements = movements.map(movement => {
        return {
          id: movement.id || movement.rowid,
          date: movement.datem,
          qty: parseFloat(movement.qty) || 0,
          price: parseFloat(movement.price) || 0,
          label: movement.label || 'Mouvement de stock',
          type: parseFloat(movement.qty) > 0 ? 'entry' : 'exit',
          warehouse_id: movement.fk_entrepot,
          user_id: movement.fk_user_author,
          origin: movement.origin || 'Manuel'
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante

      res.json({
        success: true,
        data: enrichedMovements
      });

    } catch (error) {
      logger.error(`Erreur récupération mouvements produit ${req.params.productId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des mouvements de stock',
        details: error.message
      });
    }
  }
}

module.exports = new StockController();