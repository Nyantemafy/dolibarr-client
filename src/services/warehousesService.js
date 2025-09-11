import apiService from '../components/service/apiService';

export class WarehousesService {
  static async getALLWarehouses() {
    try {
      const response = await apiService.get('/api/warehouse/liste');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des BOM: ' + error.message);
    }
  }
}