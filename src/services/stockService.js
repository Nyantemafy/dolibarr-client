import apiService from '../components/service/apiService';;

export class StockService {
  static async getStockList() {
    try {
      const response = await apiService.get('/api/stock/liste');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des stocks: ' + error.message);
    }
  }

  static async getProductMovements(productId) {
    try {
      const response = await apiService.get(`/api/stock/movements/${productId}`);
      console.log('response mouvements', response);
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des mouvements: ' + error.message);
    }
  }

  static getStockStatus(stockFinal) {
    if (stockFinal <= 0) return { label: 'Rupture', color: 'bg-red-100 text-red-800', icon: '🚨' };
    if (stockFinal <= 5) return { label: 'Faible', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    if (stockFinal <= 20) return { label: 'Moyen', color: 'bg-blue-100 text-blue-800', icon: '📦' };
    return { label: 'Bon', color: 'bg-green-100 text-green-800', icon: '✅' };
  }

  static calculateStatistics(stockData) {
    const total = stockData.length;
    const rupture = stockData.filter(item => item.stock_final <= 0).length;
    const faible = stockData.filter(item => item.stock_final > 0 && item.stock_final <= 5).length;
    const totalValue = stockData.reduce((sum, item) => sum + (item.stock_final * (item.valeur_unitaire || 0)), 0);
    
    return { total, rupture, faible, totalValue };
  }

  static filterAndSortStockData(stockData, searchTerm, filterStatus, sortConfig) {
    let filtered = [...stockData];

    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.product_ref?.toLowerCase().includes(term) ||
        item.product_label?.toLowerCase().includes(term)
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        const status = this.getStockStatus(item.stock_final);
        return status.label.toLowerCase() === filterStatus;
      });
    }

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }
}