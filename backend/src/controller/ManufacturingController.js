const dolibarrService = require('../services/dolibarrService');
const productController = require('./ProductController');
const bomsController = require('./BOMsController');
const logger = require('../utils/logger');

class ManufacturingController {
  constructor() {
    this.getManufacturingOrderById = this.getManufacturingOrderById.bind(this);
    this.fetchOrderWithDetails = this.fetchOrderWithDetails.bind(this);
  }

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

      // Récupérer la BOM
      let fk_product;
      try {
        const bom = await dolibarrService.get(`/boms/${fk_bom}`);
        fk_product = bom.fk_product;
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

      // Récupérer le produit pour obtenir le warehouse par défaut
      let fk_warehouse;
      try {
        const product = await dolibarrService.get(`/products/${fk_product}`);
        fk_warehouse = product.fk_default_warehouse;
        if (!fk_warehouse) {
          return res.status(400).json({
            success: false,
            error: 'Le produit n’a pas de warehouse par défaut'
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Produit introuvable'
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
        date_creation: new Date().toISOString().split('T')[0],
        fk_warehouse: fk_warehouse,          
        fk_warehouse_source: fk_warehouse   
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
      logger.info('Fetching all manufacturing orders from Dolibarr');
      const orders = await dolibarrService.get('/mos');
      
      if (!Array.isArray(orders)) {
        return res.json({ success: true, data: [] });
      }

      // Enrichir chaque ordre avec produit et BOM/composants
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          // Produit principal
          const product = order.fk_product
            ? await productController.getProductById(order.fk_product)
            : null;

          // BOM + composants
          const bom = order.fk_bom
            ? await bomsController.fetchBomWithComponents(order.fk_bom)
            : null;

          const components = bom?.components || [];

          return { ...order, product, bom, components };
        })
      );

      res.json({
        success: true,
        data: enrichedOrders
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

  async getManufacturingOrderById(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, error: "ID requis" });

      const order = await this.fetchOrderWithDetails(Number(id));
      if (!order) return res.status(404).json({ success: false, error: "Introuvable" });

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async fetchOrderWithDetails(id) {
    const order = await dolibarrService.get(`/mos/${id}`);
    if (!order) return null;

    // Produit principal
    const product = order.fk_product 
      ? await productController.getProductById(order.fk_product)
      : null;

    // BOM + composants
    const bom = order.fk_bom 
      ? await bomsController.fetchBomWithComponents(order.fk_bom)
      : null;

    // BOM components: vérifier si la fonction renvoie bien une liste
    const components = bom?.components || [];

    return { ...order, product, bom, components };
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
    const id = req.params.id;

    try {
      // 1. Récupérer l'OF
      const currentOrder = await dolibarrService.get(`/mos/${id}`);
      if (!currentOrder) {
        return res.status(404).json({ success: false, error: "OF non trouvé" });
      }
      if (![1, 2].includes(currentOrder.status)) {
        return res.status(400).json({ success: false, error: "OF non validé" });
      }
      if (!currentOrder.lines || currentOrder.lines.length === 0) {
        return res.status(400).json({ success: false, error: "OF ne contient aucune ligne" });
      }

      // 2. Construire arraytoconsume et arraytoproduce
      const arraytoconsume = currentOrder.lines
        .filter(line => line.role === "toconsume")
        .map(line => ({
          objectid: line.fk_product,
          qty: Number(line.qty),
          fk_warehouse: line.fk_warehouse || currentOrder.fk_warehouse
        }));

      const arraytoproduce = currentOrder.lines
        .filter(line => line.role === "toproduce")
        .map(line => ({
          objectid: line.fk_product,
          qty: Number(line.qty),
          fk_warehouse: line.fk_warehouse || currentOrder.fk_warehouse
        }));

      const data = {
        inventorylabel: `Production OF ${currentOrder.ref}`,
        inventorycode: `PROD${Date.now()}${id}`,
        autoclose: 1
      };

      logger.info("▶️ Production OF", {
        id,
        ref: currentOrder.ref,
        warehouse: currentOrder.fk_warehouse,
        payload: data
      });

      // 4. Appeler Dolibarr
      const response = await dolibarrService.post(`/mos/${id}/produceandconsumeall`, data);

      // 5. Mettre à jour le statut
      await dolibarrService.put(`/mos/${id}`, {
        status: 3,
        date_production: new Date().toISOString().split('T')[0]
      });

      return res.json({
        success: true,
        message: "Production terminée",
        data: { id: parseInt(id), status: 3, response }
      });

    } catch (error) {
      logger.error("❌ Erreur production OF", {
        id,
        message: error.message,
        dolibarrError: error.response?.data || null
      });
      return res.status(500).json({
        success: false,
        error: "Erreur production OF",
        details: error.message,
        dolibarrError: error.response?.data || null
      });
    }
  }

  async produceOrderWithArray(req, res) {
    try {
      const { id } = req.params;
      logger.info(`Production de l'ordre de fabrication ${id}`);

      // Vérifier que l’OF existe
      const currentOrder = await dolibarrService.get(`/mos/${id}`);
      if (!currentOrder) {
        return res.status(404).json({ success: false, error: "Ordre de fabrication non trouvé" });
      }

      if (currentOrder.status !== 1) {
        return res.status(400).json({ success: false, error: "Seuls les ordres validés peuvent être produits" });
      }

      // Récupérer le dépôt
      const productDetails = await dolibarrService.get(`/products/${currentOrder.fk_product}`);
      let warehouseId = productDetails.fk_default_warehouse;

      // Appel à produceandconsumeall (laisser Dolibarr gérer)
      const response = await dolibarrService.post(`/mos/${id}/produceandconsumeall`, {
        inventorylabel: `Production OF #${id}`,
        inventorycode: `PRODUCEAPI-${new Date().toISOString().split("T")[0]}`,
        autoclose: 1
      });

      // Mettre à jour le statut de l’OF (facultatif si autoclose fait déjà)
      await dolibarrService.put(`/mos/${id}`, {
        status: 3,
        date_production: new Date().toISOString().split("T")[0]
      });

      res.json({
        success: true,
        message: "Production terminée avec succès",
        data: { id, response }
      });

    } catch (error) {
      logger.error(`Erreur production ordre ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la production de l'ordre de fabrication",
        details: error.message
      });
    }
  }

  async createBatchManufacturingOrders(req, res) {
    try {
      const { orders } = req.body;

      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ success: false, error: 'Liste des ordres requise' });
      }

      logger.info(`Création de ${orders.length} ordres de fabrication en lot`);

      const results = [];
      const errors = [];

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        try {
          // 1. Récupération du BOM
          const bom = await dolibarrService.get(`/boms/${order.bom_id}`);

          // 2. Création de l'ordre de fabrication
          const orderData = {
            ref: `MO-BATCH-${Date.now()}-${i + 1}`,
            label: order.label || `Fabrication lot ${bom.ref}`,
            fk_bom: order.bom_id,
            fk_product: bom.fk_product,
            qty: parseFloat(order.qty),
            mrptype: 0,
            status: 0, // Brouillon
            date_creation: new Date().toISOString(),
            fk_user_creat: 1
          };

          const createdOrderId = await dolibarrService.post('/mos', orderData);

           // Valide
          await dolibarrService.put(`/mos/${createdOrderId}`, {
            status: 1,
            date_valid: new Date().toISOString().split('T')[0]
          });

          // Produire
          try {
            await dolibarrService.post(`/mos/${createdOrderId}/consumeandproduceall`, { closemo: 1 });
          } catch {
            await dolibarrService.put(`/mos/${createdOrderId}`, {
              status: 3,
              date_production: new Date().toISOString().split('T')[0]
            });
          }

          // 5. Récupération finale pour infos
          const createdOrderInfo = await dolibarrService.get(`/mos/${createdOrderId}`);

          results.push({
            order_index: i,
            bom_id: order.bom_id,
            bom_ref: bom.ref,
            qty: order.qty,
            mo_id: createdOrderId,
            mo_ref: createdOrderInfo.ref,
            status: 'success'
          });

        } catch (error) {
          logger.error(`Erreur ordre ${i}:`, error);
          errors.push({
            order_index: i,
            bom_id: order.bom_id,
            qty: order.qty,
            error: error.message,
            status: 'error'
          });
        }
      }

      res.json({
        success: errors.length === 0,
        data: {
          total_orders: orders.length,
          successful: results.length,
          failed: errors.length,
          results: results,
          errors: errors
        }
      });

    } catch (error) {
      logger.error('Erreur création lot ordres fabrication:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du lot d\'ordres de fabrication',
        details: error.message
      });
    }
  }

  async updateManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      let updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: "ID invalide" });
      }

      updateData = cleanUpdateData(updateData);

      const updated = await dolibarrService.put(`/mos/${id}`, updateData);

      return res.json({
        success: true,
        message: "Ordre mis à jour avec succès",
        data: {
          id: parseInt(id),
          ...updateData,
          ...(updated || {})
        }
      });
    } catch (error) {
      console.error("Error updating manufacturing order:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la mise à jour",
        details: error.message
      });
    }
  }

  async deleteManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: "ID d'ordre de fabrication invalide" 
        });
      }

      logger.info(`Tentative de suppression de l'ordre de fabrication ${id}`);

      // 1. Vérifier si l'ordre existe
      const order = await dolibarrService.get(`/mos/${id}`);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: "Ordre de fabrication non trouvé" 
        });
      }

      // 2. Vérifier si l'ordre peut être supprimé (seuls les brouillons ou certains statuts)
      // 9 pour annule
      // if (order.status !== 0) { // 0 = brouillon
      //   return res.status(400).json({ 
      //     success: false, 
      //     error: "Seuls les ordres en statut 'Brouillon' peuvent être supprimés" 
      //   });
      // }

      // 3. Supprimer l'ordre
      const result = await dolibarrService.delete(`/mos/${id}`);

      logger.info(`Ordre de fabrication ${id} supprimé avec succès`);

      res.json({
        success: true,
        message: 'Ordre de fabrication supprimé avec succès',
        data: { id: parseInt(id) }
      });

    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'ordre ${req.params.id}:`, error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 404) {
        return res.status(404).json({ 
          success: false, 
          error: 'Ordre de fabrication non trouvé' 
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de l\'ordre de fabrication',
        details: error.message
      });
    }
  }

  async deleteMultipleManufacturingOrders(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Liste d'IDs requise" 
        });
      }

      logger.info(`Tentative de suppression de ${ids.length} ordres de fabrication`);

      const results = [];
      const errors = [];

      for (const id of ids) {
        try {
          // Vérifier si l'ordre existe et peut être supprimé
          const order = await dolibarrService.get(`/mos/${id}`);
          
          if (!order) {
            errors.push({ id, error: 'Non trouvé' });
            continue;
          }

          if (order.status !== 0) {
            errors.push({ id, error: 'Statut non autorisé pour la suppression' });
            continue;
          }

          // Supprimer l'ordre
          await dolibarrService.delete(`/mos/${id}`);
          results.push(id);

          logger.info(`Ordre de fabrication ${id} supprimé avec succès`);

        } catch (error) {
          logger.error(`Erreur lors de la suppression de l'ordre ${id}:`, error);
          errors.push({ id, error: error.message });
        }
      }

      res.json({
        success: errors.length === 0,
        message: `Suppression de ${results.length} ordre(s) sur ${ids.length}`,
        data: {
          total: ids.length,
          successful: results.length,
          failed: errors.length,
          results: results,
          errors: errors
        }
      });

    } catch (error) {
      logger.error('Erreur lors de la suppression multiple des ordres:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression multiple des ordres de fabrication',
        details: error.message
      });
    }
  }

  getStatusLabel(status) {
    const statusMap = {
      0: 'Brouillon',
      1: 'Validé',
      2: 'En production',
      3: 'Produit',
      9: 'Annulé'
    };
    return statusMap[status] || 'Inconnu';
  }

}

  function cleanUpdateData(data) {
    const cleaned = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

module.exports = new ManufacturingController();

