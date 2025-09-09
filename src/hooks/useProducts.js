import { useState, useEffect } from 'react';
import apiService from '../components/service/apiService';

export const useProducts = () => {
  const [productLabels, setProductLabels] = useState([]);

  const loadProducts = async () => {
    try {
      const response = await apiService.get('/api/products/liste');
      setProductLabels(response.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { productLabels };
};
