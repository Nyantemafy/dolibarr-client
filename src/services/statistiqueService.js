import apiService from '../components/service/apiService';

export class StatistiqueService {
  static async getState(date) {
    try {
      const response = await apiService.get(`/api/statistique/liste?date=${date}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}