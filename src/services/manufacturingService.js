import apiService from '../components/service/apiService';

export class ManufacturingService {
  static async getOrders() {
    const response = await apiService.get('/api/manufacturing/liste');
    return response.data || [];
  }

  static async getOrderById(orderId) {
    const response = await apiService.get(`/api/manufacturing/getById/${orderId}`);
    return response?.data?.data || response?.data || null;
  }

  static async createOrder(orderData) {
    const response = await apiService.post('/api/manufacturing/create', orderData);
    return response.data;
  }

  static async updateOrder(orderId, updateData) {
    const response = await apiService.put(`/api/manufacturing/update/${orderId}`, updateData);
    return response;
  }

  static async deleteOrder(orderId) {
    await apiService.delete(`/api/manufacturing/delete/${orderId}`);
  }

  static async validateOrder(orderId) {
    await apiService.post(`/api/manufacturing/validation/${orderId}`);
  }

  static async produceOrder(orderId) {
    await apiService.post(`/api/manufacturing/produire/${orderId}`);
  }

  static async batchCreateOrders(orders) {
    const response = await apiService.post('/api/manufacturing/orders/batch', { orders });
    return response.data;
  }
}