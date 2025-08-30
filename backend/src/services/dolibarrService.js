const axios = require('axios');
const logger = require('../utils/logger');

class DolibarrService {
  constructor() {
    this.apiUrl = process.env.DOLIBARR_API_URL;
    console.log('Dolibarr API URL:', this.apiUrl);
    this.apiKey = process.env.DOLIBARR_API_KEY;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'DOLAPIKEY': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Intercepteur pour les logs
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Dolibarr API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Dolibarr API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Dolibarr API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  handleApiError(error) {
    if (error.response) {
      logger.error(`Dolibarr API Error ${error.response.status}:`, {
        url: error.config?.url,
        data: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      logger.error('Dolibarr API No Response:', error.message);
    } else {
      logger.error('Dolibarr API Setup Error:', error.message);
    }
  }

  async get(endpoint) {
    try {
      logger.info(`Dolibarr GET request: ${this.apiUrl}${endpoint}`);
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  formatError(error) {
    if (error.response?.data) {
      const errorData = error.response.data;
      return new Error(
        errorData.error?.message || 
        errorData.message || 
        `API Error ${error.response.status}`
      );
    }
    return new Error(error.message || 'Unknown API error');
  }
}

module.exports = new DolibarrService();