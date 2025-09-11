import apiService from '../components/service/apiService';

export class BomService {
  static async fetchBOMs() {
    try {
      const response = await apiService.get('/api/boms/liste');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des BOM: ' + error.message);
    }
  }

  static async create(bomData) {
    const response = await apiService.post('/api/boms/creat', bomData);
    return response;
  }
}