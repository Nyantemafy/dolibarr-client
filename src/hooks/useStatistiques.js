import { useState, useCallback } from 'react';
import { StatistiqueService } from '../services/statistiqueService';

export const useStatistiques = (showNotification) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStatistiques = useCallback(async (date) => {
    try {
      setLoading(true);
      const response = await StatistiqueService.getState(date);
      console.log(response);
      setStats(response || []);
    } catch (error) {
      showNotification("Erreur lors du chargement des statistiques", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return { stats, loading, loadStatistiques };
};
