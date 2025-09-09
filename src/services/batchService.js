import apiService from '../components/service/apiService';

export class BatchService {
  static async startBatchManufacturing(orders) {
    try {
      const response = await apiService.post('/api/manufacturing/orders/batch', { orders });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors de la fabrication');
      }
    } catch (error) {
      throw new Error('Erreur lors de la fabrication: ' + error.message);
    }
  }

  static calculateQueueSummary(queue) {
    return {
      totalItems: queue.length,
      totalQuantity: queue.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: queue.reduce((sum, item) => sum + (item.totalValue || 0), 0)
    };
  }

  static filterBOMs(boms, searchTerm) {
    if (!searchTerm) return boms;
    
    const term = searchTerm.toLowerCase();
    return boms.filter(bom =>
      bom.ref?.toLowerCase().includes(term) ||
      bom.label?.toLowerCase().includes(term) ||
      bom.product_ref?.toLowerCase().includes(term) ||
      bom.product_label?.toLowerCase().includes(term)
    );
  }
}