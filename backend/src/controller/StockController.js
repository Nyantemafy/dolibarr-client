const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class StockController {

  constructor() {
    this.fetchAllProducts = this.fetchAllProducts.bind(this);
    this.fetchProductStock = this.fetchProductStock.bind(this);
    this.fetchStockMovementsForProduct = this.fetchStockMovementsForProduct.bind(this);
    this.mapWithConcurrency = this.mapWithConcurrency.bind(this);
    this.getStockList = this.getStockList.bind(this);
  }

  async fetchAllProducts() {
    const resp = await dolibarrService.get('/products');
    const products = Array.isArray(resp) ? resp : (resp?.data || []);
    return products;
  }

  async fetchProductStock(productId) {
    try {
      const url = `/products/${productId}/stock`;
      const resp = await dolibarrService.get(url);

      // Si c'est un objet avec stock_reel, on le retourne dans un tableau pour garder la compatibilité
      let stockInfo;
      if (Array.isArray(resp)) {
        stockInfo = resp;
      } else if (resp && resp.stock_reel !== undefined) {
        stockInfo = [resp]; // on enveloppe dans un tableau
      } else {
        stockInfo = resp?.data || [];
      }

      return stockInfo;

    } catch (err) {
      return [];
    }
  }

  async fetchStockMovementsForProduct(productId, { limit = 500 } = {}) {
    try {
      const all = [];
      let page = 1;

      while (true) {
        const path = `/stockmovements?limit=${limit}`;
        const resp = await dolibarrService.get(path);

        const items = Array.isArray(resp) ? resp : (resp?.data || []);
        if (!Array.isArray(items) || items.length === 0) break;

        // 👉 Filtrer sur le produit
        const movements = items.filter(m => String(m.product_id) === String(productId));

        // 👉 Enrichir
        const enrichedMovements = movements.map(movement => ({
          id: movement.id || movement.rowid,
          date: movement.datem || movement.date,
          qty: parseFloat(movement.qty) || 0,
          price: parseFloat(movement.price) || 0,
          label: movement.label || 'Mouvement de stock',
          type: parseFloat(movement.qty) > 0 ? 'entry' : 'exit',
          warehouse_id: movement.fk_entrepot || movement.fk_warehouse,
          user_id: movement.fk_user_author,
          origin: movement.origin || 'Manuel'
        }));

        all.push(...enrichedMovements);

        if (items.length < limit) break;
        page++;
      }

      // 👉 Tri par date décroissante
      return all.sort((a, b) => new Date(b.date) - new Date(a.date));

    } catch (error) {
      logger.error(`Erreur fetchStockMovementsForProduct(${productId}):`, error);
      throw error;
    }
  }

  async mapWithConcurrency(items, worker, concurrency = 5) {
    const results = [];
    let index = 0;

    async function next() {
      while (index < items.length) {
        const i = index++;
        try {
          results[i] = await worker(items[i], i);
        } catch (err) {
          results[i] = { error: err.message || String(err) };
        }
      }
    }

    const workers = new Array(Math.min(concurrency, items.length)).fill(null).map(() => next());
    await Promise.all(workers);
    return results;
  }

  async getStockList(req, res) {
    try {

      const products = await this.fetchAllProducts();
      if (!Array.isArray(products) || products.length === 0) {
        console.log('⚠️ getStockList: aucun produit trouvé');
        return res.json({ success: false, data: [] });
      }

      const worker = async (product) => {
        const productId = product.id || product.rowid;

        const [stockInfo, movements] = await Promise.all([
          this.fetchProductStock(productId),
          this.fetchStockMovementsForProduct(productId)
        ]);

        return calculateStockSummary(product, stockInfo, movements);
      };

      const concurrency = 6;
      const stockData = await this.mapWithConcurrency(products, worker, concurrency);

      return res.json({ success: true, data: stockData });

    } catch (err) {
      console.error('❌ getStockList: erreur', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des stocks',
        details: err.message
      });
    }
  }

  async getProductMovements(req, res) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'ID produit requis'
        });
      }

      // Récupération de tous les mouvements (ou d'une page si tu veux limiter)
      const resp = await dolibarrService.get(`/stockmovements?limit=1000`);

      const allMovements = Array.isArray(resp) ? resp : (resp?.data || []);
      
      // Filtrer côté code sur le produit
      const movements = allMovements.filter(m => String(m.product_id) === String(productId));

      const enrichedMovements = movements.map(movement => {
        return {
          id: movement.id || movement.rowid,
          date: movement.datem || movement.date,
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

function calculateStockSummary(product, stockInfo = [], movements = []) {
  // Stock réel total (stock final)
  const currentStock = stockInfo.reduce((s, w) => s + (parseFloat(w.stock_reel) || 0), 0);

  // Valeur stock = stock réel * prix unitaire produit
  const stockValue = stockInfo.reduce((s, w) => s + ((parseFloat(w.stock_reel) || 0) * (parseFloat(product.price) || 0)), 0);

  // Tri des mouvements par date croissante pour trouver le premier
  const sortedMovements = [...movements].sort(
    (a, b) => (a.datem || a.date) - (b.datem || b.date)
  );

  // Stock initial = quantité du premier mouvement entrant (>0)
  const firstEntry = sortedMovements.find(m => parseFloat(m.qty) > 0);
  const stockInitial = firstEntry ? parseFloat(firstEntry.qty) : 0;

  const totalMovements = Math.abs(stockInitial - currentStock);

  const lastMovementDate = movements.length > 0 ? (movements[movements.length - 1].datem || movements[movements.length - 1].date) : null;

  return {
    id: product.id || product.rowid,
    product_ref: product.ref || 'N/A',
    product_label: product.label || product.name || 'N/A',
    stock_initial: stockInitial,       
    total_movements: totalMovements,
    stock_final: currentStock,
    valeur_unitaire: parseFloat(product.price) || 0,
    valeur_stock: stockValue,
    last_movement_date: lastMovementDate,
    raw_stock_info: stockInfo,
    raw_movements_count: movements.length
  };
}



module.exports = new StockController();