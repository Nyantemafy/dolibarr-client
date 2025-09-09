import { useState, useEffect } from 'react';
import { ProductService } from '../services/productService';

export const useProducts = () => {
  const [productLabels, setProductLabels] = useState([]);

  const loadProducts = async () => {
    try {
      const response = await ProductService.fetchBOMs();
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
