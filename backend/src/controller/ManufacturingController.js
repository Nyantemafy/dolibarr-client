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
        fk_product: fk_product, 
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
      logger.info('Fetching BOMs from Dolibarr');
      const boms = await dolibarrService.get('/mos');
      res.json({
        success: true,
        data: Array.isArray(boms) ? boms : []
      });
      
    } catch (error) {
      logger.error('Error fetching manufacturing orders:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des ordres de fabrication',
        details: error.message
      });
    }
  }

  async validateOrder(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Validation de l'ordre de fabrication ${id}`);

      // Récupération de l'ordre actuel
      const currentOrder = await dolibarrService.get(`/mos/${id}`);
      
      if (!currentOrder) {
        return res.status(404).json({
          success: false,
          error: 'Ordre de fabrication non trouvé'
        });
      }

      if (currentOrder.status !== 0) {
        return res.status(400).json({
          success: false,
          error: 'Seuls les ordres en brouillon peuvent être validés'
        });
      }

      // Données pour la validation
      const validationData = {
        status: 1,
        date_valid: new Date().toISOString().split('T')[0]
      };

      // Appel API Dolibarr pour valider
      const result = await dolibarrService.put(`/mos/${id}`, validationData);

      logger.info(`Ordre de fabrication ${id} validé avec succès`);

      res.json({
        success: true,
        message: 'Ordre de fabrication validé avec succès',
        data: result
      });

    } catch (error) {
      logger.error(`Erreur validation ordre ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la validation de l\'ordre de fabrication',
        details: error.message
      });
    }
  }

  async produceOrder(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Production de l'ordre de fabrication ${id}`);

      // Récupération de l'ordre actuel
      const currentOrder = await dolibarrService.get(`/mos/${id}`);
      
      if (!currentOrder) {
        return res.status(404).json({
          success: false,
          error: 'Ordre de fabrication non trouvé'
        });
      }

      if (currentOrder.status !== 1) {
        return res.status(400).json({
          success: false,
          error: 'Seuls les ordres validés peuvent être produits'
        });
      }

      // Étape 1: Consommer les matières premières
      logger.info(`Consommation des matières premières pour l'ordre ${id}`);
      try {
        await dolibarrService.post(`/mos/${id}/consumeandproduceall`, {
          closemo: 1 // Fermer l'ordre après production
        });
      } catch (consumeError) {
        // Si l'endpoint consumeandproduceall n'existe pas, essayer une approche alternative
        logger.warn('Endpoint consumeandproduceall non disponible, utilisation méthode alternative');
        
        // Mise à jour du statut directement
        await dolibarrService.put(`/mos/${id}`, {
          status: 3, // État "fabriqué"
          date_production: new Date().toISOString().split('T')[0]
        });
      }

      logger.info(`Ordre de fabrication ${id} produit avec succès`);

      res.json({
        success: true,
        message: 'Production terminée avec succès',
        data: { id, status: 3 }
      });

    } catch (error) {
      logger.error(`Erreur production ordre ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la production de l\'ordre de fabrication',
        details: error.message
      });
    }
  }

}

module.exports = new ManufacturingController();