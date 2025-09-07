const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class ResetController {
  async resetAllData(req, res) {
    const backup = {
      manufacturing_orders: [],
      boms: [],
      products: [],
      stock: []
    };

    try {
      logger.info('Début de la réinitialisation des données Dolibarr (tout ou rien)');

      // 1️⃣ Backup des données
      logger.info('Récupération des entrepôts...');
      backup.warehouses = await dolibarrService.get('/warehouses').catch(() => []) || [];

      logger.info('Récupération des ordres de fabrication...');
      backup.manufacturing_orders = await dolibarrService.get('/mos').catch(() => []) || [];

      logger.info('Récupération des BOMs...');
      backup.boms = await dolibarrService.get('/boms').catch(() => []) || [];

      logger.info('Récupération des produits...');
      backup.products = await dolibarrService.get('/products').catch(() => []) || [];

      // Backup des stocks
      for (const product of backup.products) {
        try {
          const stockRaw = await dolibarrService.get(`/products/${product.id}/stock`).catch(() => []);
          const stockInfo = Array.isArray(stockRaw) ? stockRaw : (stockRaw?.data || []);
          backup.stock.push({ product_id: product.id, stock: stockInfo });
        } catch (error) {
          logger.warn(`Impossible de récupérer le stock pour le produit ${product.id}: ${error.message}`);
          backup.stock.push({ product_id: product.id, stock: [] });
        }
      }

      // 2️⃣ Suppression des données
      logger.info('Suppression des entrepôts...');
      for (const wh of backup.warehouses) {
        await dolibarrService.delete(`/warehouses/${wh.id}`).catch(err => {
          logger.warn(`Impossible de supprimer l'entrepôt ${wh.id}: ${err.message}`);
        });
      }

      logger.info('Suppression des ordres de fabrication...');
      for (const mo of backup.manufacturing_orders) {
        await dolibarrService.delete(`/mos/${mo.id}`).catch(err => {
          logger.warn(`Impossible de supprimer l'ordre de fabrication ${mo.id}: ${err.message}`);
        });
      }

      logger.info('Suppression des BOMs...');
      for (const bom of backup.boms) {
        await dolibarrService.delete(`/boms/${bom.id}`).catch(err => {
          logger.warn(`Impossible de supprimer le BOM ${bom.id}: ${err.message}`);
        });
      }

      logger.info('Suppression des produits...');
      for (const product of backup.products) {
        await dolibarrService.delete(`/products/${product.id}`).catch(err => {
          logger.warn(`Impossible de supprimer le produit ${product.id}: ${err.message}`);
        });
      }

      logger.info('Réinitialisation des stocks...');
      for (const stockEntry of backup.stock) {
        const stocks = Array.isArray(stockEntry.stock) ? stockEntry.stock : [];
        for (const stock of stocks) {
          if (stock.real && parseFloat(stock.real) !== 0) {
            const correctionQty = -parseFloat(stock.real);
            await dolibarrService.post(`/products/${stockEntry.product_id}/stock/correction`, {
              qty: correctionQty,
              warehouse_id: stock.warehouse_id || 1,
              price: 0,
              label: 'Réinitialisation automatique'
            }).catch(err => {
              logger.warn(`Impossible de corriger le stock pour le produit ${stockEntry.product_id}: ${err.message}`);
            });
          }
        }
      }

      logger.info('Réinitialisation terminée avec succès');
      return res.json({ success: true, message: 'Toutes les données ont été supprimées avec succès' });

    } catch (error) {
      logger.error('Erreur détectée, restauration des données...', error);

      // 3️⃣ Restauration depuis le backup
      try {
        // Restaurer produits d'abord
        for (const product of backup.products) {
          const existing = await dolibarrService.get(`/products/${product.id}`).catch(() => null);
          if (!existing) {
            await dolibarrService.post('/products', product).catch(err => {
              logger.error(`Erreur restauration produit ${product.id}: ${err.message}`);
            });
          } else {
            await dolibarrService.put(`/products/${product.id}`, product).catch(err => {
              logger.error(`Erreur mise à jour produit ${product.id}: ${err.message}`);
            });
          }
        }

        // Restaurer BOM
        for (const bom of backup.boms) {
          await dolibarrService.post('/boms', bom).catch(err => {
            logger.error(`Erreur restauration BOM ${bom.id}: ${err.message}`);
          });
        }

        // Restaurer MO
        for (const mo of backup.manufacturing_orders) {
          await dolibarrService.post('/mos', mo).catch(err => {
            logger.error(`Erreur restauration MO ${mo.id}: ${err.message}`);
          });
        }

        // Restaurer stocks
        for (const stockEntry of backup.stock) {
          const stocks = Array.isArray(stockEntry.stock) ? stockEntry.stock : [];
          for (const stock of stocks) {
            if (stock.real && parseFloat(stock.real) !== 0) {
              await dolibarrService.post(`/products/${stockEntry.product_id}/stock/correction`, {
                qty: parseFloat(stock.real),
                warehouse_id: stock.warehouse_id || 1,
                price: 0,
                label: 'Restauration automatique'
              }).catch(err => {
                logger.error(`Erreur restauration stock produit ${stockEntry.product_id}: ${err.message}`);
              });
            }
          }
        }

        logger.info('Restauration terminée après erreur');
        return res.status(500).json({
          success: false,
          error: 'Erreur pendant la réinitialisation, données partiellement restaurées',
          details: error.message
        });

      } catch (restoreError) {
        logger.error('Erreur critique restauration des données:', restoreError);
        return res.status(500).json({
          success: false,
          error: 'Erreur critique : impossible de restaurer complètement les données',
          details: restoreError.message
        });
      }
    }
  }

  async resetConfirm(req, res) {
    try {
      const counts = {
        products: 0,
        boms: 0
      };

      try {
        const mos = await dolibarrService.get('/mos');
        counts.mos = Array.isArray(mos) ? mos.length : 0;
      } catch (error) {
        logger.error('Erreur lors de la récupération des Ordre de fabrication:', error);
        return res.status(500).json({
          success: false,
          error: 'Impossible de récupérer les Ordre de fabrication',
          details: error.message
        });
      }

      try {
        const products = await dolibarrService.get('/products');
        counts.products = Array.isArray(products) ? products.length : 0;
      } catch (error) {
        logger.error('Erreur lors de la récupération des produits:', error);
        return res.status(500).json({
          success: false,
          error: 'Impossible de récupérer les produits',
          details: error.message
        });
      }

      try {
        const boms = await dolibarrService.get('/boms');
        counts.boms = Array.isArray(boms) ? boms.length : 0;
      } catch (error) {
        logger.error('Erreur lors de la récupération des BOMs:', error);
        return res.status(500).json({
          success: false,
          error: 'Impossible de récupérer les BOMs',
          details: error.message
        });
      }

      res.json({
        success: true,
        message: 'Données à supprimer',
        data: counts,
        total: counts.products + counts.boms
      });

    } catch (error) {
      logger.error('Erreur inattendue lors de la vérification des données:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur inattendue lors de la vérification des données',
        details: error.message
      });
    }
  }

}

module.exports = new ResetController();