const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class ResetController {
  async resetAllData(req, res) {
    try {
      logger.info('Début de la réinitialisation des données Dolibarr');
      
      const results = {
        manufacturing_orders: { deleted: 0, errors: [] },
        boms: { deleted: 0, errors: [] },
        stock_movements: { deleted: 0, errors: [] },
        products: { deleted: 0, errors: [] }
      };

      // 1. Supprimer les ordres de fabrication (Manufacturing Orders)
      logger.info('Suppression des ordres de fabrication...');
      try {
        const manufacturingOrders = await dolibarrService.get('/mrp');
        if (Array.isArray(manufacturingOrders)) {
          for (const order of manufacturingOrders) {
            try {
              await dolibarrService.delete(`/mrp/${order.id}`);
              results.manufacturing_orders.deleted++;
              logger.debug(`Ordre de fabrication ${order.id} supprimé`);
            } catch (error) {
              results.manufacturing_orders.errors.push({
                id: order.id,
                error: error.message
              });
              logger.error(`Erreur suppression ordre ${order.id}:`, error.message);
            }
          }
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des ordres de fabrication:', error.message);
        results.manufacturing_orders.errors.push({
          general: 'Impossible de récupérer les ordres de fabrication'
        });
      }

      // 2. Supprimer les nomenclatures (BOMs)
      logger.info('Suppression des nomenclatures...');
      try {
        const boms = await dolibarrService.get('/boms');
        if (Array.isArray(boms)) {
          for (const bom of boms) {
            try {
              await dolibarrService.delete(`/boms/${bom.id}`);
              results.boms.deleted++;
              logger.debug(`BOM ${bom.id} supprimée`);
            } catch (error) {
              results.boms.errors.push({
                id: bom.id,
                error: error.message
              });
              logger.error(`Erreur suppression BOM ${bom.id}:`, error.message);
            }
          }
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des BOMs:', error.message);
        results.boms.errors.push({
          general: 'Impossible de récupérer les nomenclatures'
        });
      }

      // 3. Réinitialiser les stocks (Stock Movements)
      logger.info('Réinitialisation des stocks...');
      try {
        const products = await dolibarrService.get('/products');
        if (Array.isArray(products)) {
          for (const product of products) {
            try {
              // Récupérer le stock actuel
              const stockInfo = await dolibarrService.get(`/products/${product.id}/stock`);
              
              if (Array.isArray(stockInfo)) {
                for (const stock of stockInfo) {
                  if (stock.real && parseFloat(stock.real) !== 0) {
                    // Créer un mouvement de correction pour remettre à zéro
                    const correctionQty = -parseFloat(stock.real);
                    await dolibarrService.post(`/products/${product.id}/stock/correction`, {
                      qty: correctionQty,
                      warehouse_id: stock.warehouse_id || 1,
                      price: 0,
                      label: 'Réinitialisation automatique'
                    });
                    results.stock_movements.deleted++;
                  }
                }
              }
              logger.debug(`Stock du produit ${product.id} réinitialisé`);
            } catch (error) {
              results.stock_movements.errors.push({
                product_id: product.id,
                error: error.message
              });
              logger.error(`Erreur réinitialisation stock produit ${product.id}:`, error.message);
            }
          }
        }
      } catch (error) {
        logger.error('Erreur lors de la réinitialisation des stocks:', error.message);
        results.stock_movements.errors.push({
          general: 'Impossible de réinitialiser les stocks'
        });
      }

      // 4. Supprimer les produits
      logger.info('Suppression des produits...');
      try {
        const products = await dolibarrService.get('/products');
        if (Array.isArray(products)) {
          for (const product of products) {
            try {
              await dolibarrService.delete(`/products/${product.id}`);
              results.products.deleted++;
              logger.debug(`Produit ${product.id} supprimé`);
            } catch (error) {
              results.products.errors.push({
                id: product.id,
                error: error.message
              });
              logger.error(`Erreur suppression produit ${product.id}:`, error.message);
            }
          }
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des produits:', error.message);
        results.products.errors.push({
          general: 'Impossible de récupérer les produits'
        });
      }

      // Calcul du résumé
      const totalDeleted = results.manufacturing_orders.deleted + 
                          results.boms.deleted + 
                          results.stock_movements.deleted + 
                          results.products.deleted;
      
      const totalErrors = results.manufacturing_orders.errors.length + 
                         results.boms.errors.length + 
                         results.stock_movements.errors.length + 
                         results.products.errors.length;

      logger.info(`Réinitialisation terminée: ${totalDeleted} éléments supprimés, ${totalErrors} erreurs`);

      res.json({
        success: true,
        message: `Réinitialisation terminée: ${totalDeleted} éléments supprimés`,
        data: results,
        summary: {
          total_deleted: totalDeleted,
          total_errors: totalErrors,
          details: {
            manufacturing_orders: `${results.manufacturing_orders.deleted} supprimés`,
            boms: `${results.boms.deleted} supprimées`,
            stock_resets: `${results.stock_movements.deleted} réinitialisés`,
            products: `${results.products.deleted} supprimés`
          }
        }
      });

    } catch (error) {
      logger.error('Erreur générale lors de la réinitialisation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la réinitialisation des données',
        details: error.message
      });
    }
  }

  async resetConfirm(req, res) {
    // Endpoint pour confirmer avant suppression
    try {
      const counts = {
        products: 0,
        boms: 0,
        manufacturing_orders: 0,
        stock_entries: 0
      };

      // Compter les éléments à supprimer
      try {
        const products = await dolibarrService.get('/products');
        counts.products = Array.isArray(products) ? products.length : 0;
      } catch (e) { /* ignore */ }

      try {
        const boms = await dolibarrService.get('/boms');
        counts.boms = Array.isArray(boms) ? boms.length : 0;
      } catch (e) { /* ignore */ }

      try {
        const mrp = await dolibarrService.get('/mrp');
        counts.manufacturing_orders = Array.isArray(mrp) ? mrp.length : 0;
      } catch (e) { /* ignore */ }

      res.json({
        success: true,
        message: 'Données à supprimer',
        data: counts,
        total: counts.products + counts.boms + counts.manufacturing_orders
      });

    } catch (error) {
      logger.error('Erreur lors de la vérification des données:', error);
      res.status(500).json({
        success: false,
        error: 'Impossible de vérifier les données à supprimer'
      });
    }
  }
}

module.exports = new ResetController();