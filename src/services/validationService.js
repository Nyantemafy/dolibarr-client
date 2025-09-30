import {STATUS_COLORS } from '../utils/previewConstants';
import apiService from '../components/service/apiService';

export class ValidationService {
  static async validateImportData(importData) {
    try {
      const response = await apiService.post('/api/import/preview', importData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static getValidationStatus(item) {
    if (!item.isValid) return 'error';
    if (item.warnings && item.warnings.length > 0) return 'warning';
    return 'success';
  }

  static getRowClass(status) {
    const { bg, border } = STATUS_COLORS[status] || {};
    return `${bg} ${border}`;
  }
}