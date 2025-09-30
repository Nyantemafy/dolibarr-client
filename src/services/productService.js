import apiService from '../components/service/apiService';

export class ProductService {
  static async createProduct(orderData) {
    try {
      const response = await apiService.post('/api/products/create', orderData);
      
      if (response) {
        console.log('response', response)
        return response;
      } else {
        throw new Error(response.data?.error || 'Erreur lors de la création');
      }
    } catch (error) {
      throw new Error('Erreur lors de la création: ' + error.message);
    }
  }

  static async updateProduct(productId, productData) {
    const response = await apiService.put(`/api/products/update/${productId}`, productData);
    return response.data;
  }

  static async getProductById(productId) {
    const response = await apiService.get(`/api/products/getById/${productId}`);
    return response || null;
  }

  static async getAllProducts() {
    const response = await apiService.get(`/api/products/liste`);
    console.log(response);
    return response.data || [];
  }

  static async correctStock(payload) {
    try {
      const response = await apiService.post('/api/products/correct', payload);
      return response;
    } catch (err) {
      throw new Error('Erreur lors de la correction du stock: ' + err.message);
    }
  }

  static async fetchProduct() {
    try {
      const response = await apiService.get('/api/products/liste');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des BOM: ' + error.message);
    }
  }

  static async fetchFinishedProducts() {
    try {
      const response = await apiService.get('/api/products/finished');
      return response.data || [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des produits finis: ' + error.message);
    }
  }

  static async deleteProduct(ProductId) {
    console.log('ProductId', ProductId);
    const response = await apiService.delete(`/api/products/delete/${ProductId}`);
    console.log('Response ProductId', response);
    return response.data || [];
  }
}