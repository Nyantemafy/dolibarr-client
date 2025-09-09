import apiService from '../components/service/apiService';

export class ProductService {
  static async fetchBOMs() {
    try {
      const response = await apiService.get('/api/products/liste');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des BOM: ' + error.message);
    }
  }
}