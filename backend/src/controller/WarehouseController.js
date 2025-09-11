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
}

module.exports = new WarehouseController();