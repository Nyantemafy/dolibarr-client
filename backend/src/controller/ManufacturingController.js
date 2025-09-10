const dolibarrService = require('../services/dolibarrService');
const productController = require('./ProductController');
const bomsController = require('./BOMsController');
const logger = require('../utils/logger');

class ManufacturingController {
  constructor() {
    this.getManufacturingOrderById = this.getManufacturingOrderById.bind(this);
    this.fetchOrderWithDetails = this.fetchOrderWithDetails.bind(this);
    this.getDefaultWarehouse = this.getDefaultWarehouse.bind(this);
    this.validateOrderById = this.validateOrderById.bind(this);
    this.produceOrderById = this.produceOrderById.bind(this);
    this.createBatchManufacturingOrders = this.createBatchManufacturingOrders.bind(this);
    this.createManufacturingOrder = this.createManufacturingOrder.bind(this);
    this.buildManufacturingOrderData = this.buildManufacturingOrderData.bind(this);
  }

  async buildManufacturingOrderData(fk_bom, qty, label, description) {
    const bom = await dolibarrService.get(`/boms/${fk_bom}`);
    const fk_product = bom.fk_product;

    const product = await dolibarrService.get(`/products/${fk_product}`);
    const fk_warehouse = product.fk_default_warehouse;

      return {
        fk_bom,
        fk_product,
        qty: parseFloat(qty),
        label: label || `Ordre de fabrication - BOM #${fk_bom}`,
        ref: label ? label.replace(/\s+/g, '_') : `OF_${fk_bom}_${Date.now()}`,
        mrptype: 0,
        description: description || '',
        status: 0,
        date_creation: new Date().toISOString().split('T')[0],
        fk_warehouse,
        fk_warehouse_source: fk_warehouse
      };
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

      const orderData = await this.buildManufacturingOrderData(
        req.body.fk_bom,
        req.body.qty,
        req.body.label,
        req.body.description
      );

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

  async validateOrderById(orderId) {
    logger.info(`Validation de l'ordre de fabrication ${orderId}`);

    const currentOrder = await dolibarrService.get(`/mos/${orderId}`);
    if (!currentOrder) throw new Error('Ordre de fabrication non trouvé');
    if (currentOrder.status !== 0) throw new Error('Seuls les ordres en brouillon peuvent être validés');

    const validationData = {
      status: 1,
      date_valid: new Date().toISOString().split('T')[0]
    };

    const result = await dolibarrService.put(`/mos/${orderId}`, validationData);
    logger.info(`Ordre ${orderId} validé`);
    return result;
  }

  async produceOrderById(orderId) {
    const currentOrder = await dolibarrService.get(`/mos/${orderId}`);
    if (!currentOrder) throw new Error('Ordre de fabrication non trouvé');
    if (![1, 2].includes(Number(currentOrder.status))) throw new Error('OF non validé / état incompatible');

    const lines = currentOrder.lines || [];
    if (lines.length === 0) throw new Error('OF ne contient aucune ligne');

    const productWhCache = new Map();

    const resolveWarehouseForLine = async (line) => {
      if (line.fk_warehouse) return line.fk_warehouse;
      if (currentOrder.fk_warehouse) return currentOrder.fk_warehouse;

      const productId = line.fk_product || line.product_id;
      if (!productId) return null;

      if (productWhCache.has(productId)) return productWhCache.get(productId);

      const wh = await this.getDefaultWarehouse(productId);
      productWhCache.set(productId, wh);
      return wh;
    };

    const toConsumeLines = lines.filter(l => l.role === 'toconsume');
    const toProduceLines = lines.filter(l => l.role === 'toproduce');

    const arraytoconsume = await Promise.all(
      toConsumeLines.map(async (line) => {
        const objectid = line.rowid || line.id;
        if (!objectid) throw new Error(`Missing row id for MO line (toconsume): ${JSON.stringify(line)}`);
        const fk_warehouse = await resolveWarehouseForLine(line);
        if (!fk_warehouse) throw new Error(`No warehouse for product ${line.fk_product}`);
        return { objectid, qty: Number(line.qty || 0), fk_warehouse };
      })
    );

    const arraytoproduce = await Promise.all(
      toProduceLines.map(async (line) => {
        const objectid = line.rowid || line.id;
        if (!objectid) throw new Error(`Missing row id for MO line (toproduce): ${JSON.stringify(line)}`);
        const fk_warehouse = await resolveWarehouseForLine(line);
        if (!fk_warehouse) throw new Error(`No warehouse for product ${line.fk_product}`);
        return { objectid, qty: Number(line.qty || 0), fk_warehouse };
      })
    );

    const payload = {
      inventorylabel: `Production OF ${currentOrder.ref}`,
      inventorycode: `PROD${Date.now()}${orderId}`,
      autoclose: 1,
      arraytoconsume,
      arraytoproduce
    };

    const response = await dolibarrService.post(`/mos/${orderId}/produceandconsume`, payload);

    // Mettre à jour l'état MO
    await dolibarrService.put(`/mos/${orderId}`, {
      status: 3,
      date_production: new Date().toISOString().split('T')[0]
    });

    logger.info(`Production de l'OF ${orderId} terminée`);
    return { orderId, response };
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

  async getDefaultWarehouse(productId) {
    if (!productId) return null;
    try {
      const product = await dolibarrService.get(`/products/${productId}`);
      // Certains retours peuvent utiliser fk_default_warehouse ou default_warehouse_id
      return product?.fk_default_warehouse ?? product?.default_warehouse_id ?? null;
    } catch (err) {
      // Pas trouvé ou erreur API -> on renverra null et on gérera plus bas
      logger.warn(`getDefaultWarehouse: impossible de récupérer produit ${productId}: ${err.message}`);
      return null;
    }
  }

  async produceOrder(req, res) {
    const id = req.params.id;
    try {
      // 1) Charger l'OF complet (avec lignes)
      const currentOrder = await dolibarrService.get(`/mos/${id}`);
      if (!currentOrder) return res.status(404).json({ success: false, error: "OF non trouvé" });

      // vérifier état
      if (![1, 2].includes(Number(currentOrder.status))) {
        return res.status(400).json({ success: false, error: "OF non validé / état incompatible" });
      }

      const lines = currentOrder.lines || [];
      if (lines.length === 0) {
        return res.status(400).json({ success: false, error: "OF ne contient aucune ligne" });
      }

      // cache pour limiter appels produits
      const productWhCache = new Map();

      const resolveWarehouseForLine = async (line) => {
        // priorité : ligne -> OF -> produit.default_warehouse
        if (line.fk_warehouse) return line.fk_warehouse;
        if (currentOrder.fk_warehouse) return currentOrder.fk_warehouse;

        const productId = line.fk_product || line.product_id;
        if (!productId) return null;

        if (productWhCache.has(productId)) return productWhCache.get(productId);

        const wh = await this.getDefaultWarehouse(productId);
        productWhCache.set(productId, wh);
        return wh;
      };

      // 2) Construire arraytoconsume et arraytoproduce (ATTENTION: objectid = rowid de la ligne MO)
      const toConsumeLines = lines.filter(l => l.role === "toconsume" || l.role === "toconsume"); // tolérance
      const toProduceLines = lines.filter(l => l.role === "toproduce" || l.role === "toproduce");

      const arraytoconsume = await Promise.all(
        toConsumeLines.map(async (line) => {
          const objectid = line.rowid || line.id; // utiliser la propriété existante (vérifie dans ton retour)
          if (!objectid) throw new Error(`Missing row id for MO line (toconsume): ${JSON.stringify(line)}`);
          const fk_warehouse = await resolveWarehouseForLine(line);
          if (!fk_warehouse) throw new Error(`No warehouse found for product ${line.fk_product} (line ${objectid})`);
          return { objectid, qty: Number(line.qty || 0), fk_warehouse };
        })
      );

      const arraytoproduce = await Promise.all(
        toProduceLines.map(async (line) => {
          const objectid = line.rowid || line.id;
          if (!objectid) throw new Error(`Missing row id for MO line (toproduce): ${JSON.stringify(line)}`);
          const fk_warehouse = await resolveWarehouseForLine(line);
          if (!fk_warehouse) throw new Error(`No warehouse found for product ${line.fk_product} (line ${objectid})`);
          return { objectid, qty: Number(line.qty || 0), fk_warehouse };
        })
      );

      const payload = {
        inventorylabel: `Production OF ${currentOrder.ref}`,
        inventorycode: `PROD${Date.now()}${id}`,
        autoclose: 1,
        arraytoconsume,
        arraytoproduce
      };

      logger.info("▶️ Production OF", { id, payload, ref: currentOrder.ref });

      // 3) Appel Dolibarr
      const response = await dolibarrService.post(`/mos/${id}/produceandconsume`, payload);

      // 4) Si succès, mettre à jour l'état MO (et date production)
      await dolibarrService.put(`/mos/${id}`, {
        status: 3,
        date_production: new Date().toISOString().split("T")[0]
      });

      return res.json({
        success: true,
        message: "Production terminée",
        data: { id: Number(id), status: 3, dolibarrResponse: response }
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
        try {
          const currentOrder = orders[i];

          // ⚡ Construire les données de l'ordre
          const orderData = await this.buildManufacturingOrderData(
            currentOrder.bom_id,
            currentOrder.qty,
            currentOrder.label
          );

          const createdOrder = await dolibarrService.post('/mos', orderData);

          // Récupération de l'ordre complet
          const createdOrderInfo = await dolibarrService.get(`/mos/${createdOrder}`);

          await this.validateOrderById(createdOrder);
          await this.produceOrderById(createdOrder);

          results.push({
            order_index: i,
            bom_id: currentOrder.bom_id,
            qty: currentOrder.qty,
            mo_id: createdOrder,
            mo_ref: createdOrderInfo.ref,
            status: 'success'
          });

        } catch (error) {
          logger.error(`Erreur ordre ${i}:`, error);
          errors.push({
            order_index: i,
            bom_id: orders[i].bom_id,
            qty: orders[i].qty,
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
          results,
          errors
        }
      });

    } catch (error) {
      logger.error('Erreur création lot ordres fabrication:', error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la création du lot d'ordres de fabrication",
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
        if (key === "id") cleaned[key] = parseInt(value); 
        else cleaned[key] = value;
      }
    });
    return cleaned;
  }

module.exports = new ManufacturingController();

