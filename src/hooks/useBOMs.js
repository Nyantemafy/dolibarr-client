import { useState, useEffect } from 'react';
import apiService from '../components/service/apiService';

export const useBOMs = () => {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBOMs = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/boms/liste');
      setBoms(response?.data || []);
    } catch (error) {
      console.error("Erreur chargement BOMs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBOMs();
  }, []);

  return { boms, loading, loadBOMs };
};