import apiService from '../components/service/apiService';

export class OrderService {
  static async createOrder(orderData) {
    try {
      const response = await apiService.post('/api/manufacturing/create', orderData);
      
      if (response.data && response.data.id) {
        return response.data;
      } else {
        throw new Error(response.data?.error || 'Erreur lors de la création');
      }
    } catch (error) {
      throw new Error('Erreur lors de la création: ' + error.message);
    }
  }

  static generateDefaultLabel(bom, bomsList) {
    if (!bom) return '';
    
    const selectedBomData = bomsList.find(b => b.id == bom);
    if (selectedBomData) {
      return `Ordre - ${selectedBomData.label || selectedBomData.ref}`;
    }
    return '';
  }
}