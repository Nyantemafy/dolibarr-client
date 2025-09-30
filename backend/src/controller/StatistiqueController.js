const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class StatistiqueController {
  async getStatistiquesParDate(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: "La date est obligatoire (format YYYY-MM-DD)"
        });
      }

      // ⚡ Conversion de la date en timestamp UNIX
      const allOrders = await dolibarrService.get(`/mos`);
      const dayStart = Math.floor(new Date(`${date}T00:00:00`).getTime() / 1000);
      const dayEnd = Math.floor(new Date(`${date}T23:59:59`).getTime() / 1000);

      const orders = allOrders.filter(o => o.date_creation >= dayStart && o.date_creation <= dayEnd);

      if (!Array.isArray(orders) || orders.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Construire les stats
      const statsMap = {};

      for (const order of orders) {
        const lines = order.lines || [];

        // Nb fabriqué (produits finis)
        const pf = lines.filter(l => l.role === "produced");
        for (const line of pf) {
          const key = line.fk_product;
          const product = await dolibarrService.get(`/products/${line.fk_product}`);
          if (!statsMap[key]) {
            statsMap[key] = {
              produit_id: key,
              produit_nom: product.label || "Inconnu",
              nbFabrique: 0,
              nbUtilise: 0
            };
          }
          statsMap[key].nbFabrique += line.qty || 0;
        }

        // Nb utilisé (matières premières consommées)
        const mp = lines.filter(l => l.role === "consumed");
        for (const line of mp) {
          const key = line.fk_product;
          const product = await dolibarrService.get(`/products/${line.fk_product}`);
          if (!statsMap[key]) {
            statsMap[key] = {
              produit_id: key,
              produit_nom: product.label || "Inconnu",
              nbFabrique: 0,
              nbUtilise: 0
            };
          }
          statsMap[key].nbUtilise += line.qty || 0;
        }
      }

      const statistiques = Object.values(statsMap);

      res.json({
        success: true,
        data: statistiques
      });

    } catch (error) {
      logger.error("Erreur récupération statistiques:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des statistiques",
        details: error.message
      });
    }
  }
}

module.exports = new StatistiqueController();
