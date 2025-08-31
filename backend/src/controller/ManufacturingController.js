const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class ManufacturingController {
  async createManufacturingOrder(req, res) {
    try {
      const { fk_bom, qty, label, description } = req.body;

      if (!fk_bom || !qty) {
        return res.status(400).json({
          success: false,
          error: 'BOM et quantité sont requis'
        });
      }

      if (qty <= 0) {
        return res.status(400).json({
          success: false,
          error: 'La quantité doit être supérieure à 0'
        });
      }

      let fk_product; // ← déclaration hors du try

      try {
        const bom = await dolibarrService.get(`/boms/${fk_bom}`);
        fk_product = bom.fk_product; // ← assignation ici
        if (!fk_product) {
          return res.status(400).json({
            success: false,
            error: 'La BOM sélectionnée n’a pas de produit associé'
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'BOM introuvable'
        });
      }

      const orderData = {
        fk_bom: fk_bom,
        fk_product: fk_product, // maintenant accessible
        qty: parseFloat(qty),
        label: label || `Ordre de fabrication - BOM #${fk_bom}`,
        ref: label ? label.replace(/\s+/g, '_') : `OF_${fk_bom}_${Date.now()}`,
        mrptype: 0,
        description: description || '',
        status: 0,
        date_creation: new Date().toISOString().split('T')[0]
      };

      logger.info('Creating manufacturing order:', orderData);

      const createdOrder = await dolibarrService.post('/mos', orderData);
      
      let orderId = null;
      if (typeof createdOrder === 'number') orderId = createdOrder;
      else if (createdOrder?.id) orderId = createdOrder.id;
      else if (createdOrder?.rowid) orderId = createdOrder.rowid;

      if (!orderId) {
        throw new Error(`Ordre créé mais aucun ID détecté. Réponse: ${JSON.stringify(createdOrder)}`);
      }

      logger.info(`Manufacturing order created with ID: ${orderId}`);

      res.json({
        success: true,
        data: {
          id: orderId,
          fk_bom: fk_bom,
          qty: qty,
          label: orderData.label,
          status: 'brouillon'
        }
      });

    } catch (error) {
      logger.error('Error creating manufacturing order:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'ordre de fabrication',
        details: error.message
      });
    }
  }

  async getManufacturingOrders(req, res) {
    try {
      logger.info('Fetching manufacturing orders from Dolibarr');
      
      const orders = await dolibarrService.get('/mrp');
      
      if (!Array.isArray(orders)) {
        return res.json([]);
      }

      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            if (order.fk_bom) {
              const bom = await dolibarrService.get(`/boms/${order.fk_bom}`);
              order.bom = bom;
            }
            return order;
          } catch (error) {
            logger.warn(`Could not fetch BOM details for order ${order.id}:`, error.message);
            return order;
          }
        })
      );

      res.json(enrichedOrders);
      
    } catch (error) {
      logger.error('Error fetching manufacturing orders:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des ordres de fabrication',
        details: error.message
      });
    }
  }
}

module.exports = new ManufacturingController();