const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class WarehouseController {
    async getAllWarehouse(req, res) {
        try {
          const warehouse = await dolibarrService.get('/warehouses');
          
          if (!Array.isArray(warehouse)) {
            return res.json({ success: true, data: [] });
          }
    
          res.json({
            success: true,
            data: warehouse
          });
    
        } catch (error) {
          logger.error('Error fetching warehouse:', error);
          res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des warehouse',
            details: error.message
          });
        }
    }

  async createWarehouse(req, res) {
    const { ref, label } = req.body;

    if (!ref) {
      return res.status(400).json({ success: false, error: 'La référence est obligatoire' });
    }

    try {
      const payload = {
        ref,
        label: label || ref
      };

      const result = await dolibarrService.post('/warehouses', payload);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error creating warehouse:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'entrepôt',
        details: error.message
      });
    }
  }
}

module.exports = new WarehouseController();