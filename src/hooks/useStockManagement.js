import { useState, useCallback, useMemo } from 'react';
import { StockService } from '../services/stockService';
import { useNotification } from './useNotification';

export const useStockManagement = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const { showNotification } = useNotification();

  // Correction: useCallback avec dépendances vides pour loadStockData
  const loadStockData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await StockService.getStockList();
      setStockData(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // Ajout de showNotification comme dépendance

  // Correction: useCallback pour loadProductMovements
  const loadProductMovements = useCallback(async (productId) => {
    try {
      return await StockService.getProductMovements(productId);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
      return [];
    }
  }, []);

  // Correction: useCallback pour viewProductDetails
  const viewProductDetails = useCallback(async (product) => {
    try {
      const movements = await loadProductMovements(product.id);
      setSelectedProduct({ ...product, movements });
    } catch (error) {
      showNotification('Erreur lors du chargement des détails', 'error');
    }
  }, [loadProductMovements, showNotification]);

  // Correction: useCallback pour handleSort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Données filtrées et triées
  const filteredAndSortedData = useMemo(() => {
    return StockService.filterAndSortStockData(
      stockData, 
      searchTerm, 
      filterStatus, 
      sortConfig
    );
  }, [stockData, searchTerm, filterStatus, sortConfig]);

  // Statistiques
  const statistics = useMemo(() => {
    return StockService.calculateStatistics(stockData);
  }, [stockData]);

  return {
    // State
    stockData,
    loading,
    selectedProduct,
    searchTerm,
    filterStatus,
    sortConfig,
    filteredAndSortedData,
    statistics,
    
    // Actions
    loadStockData,
    viewProductDetails,
    handleSort,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    setSelectedProduct
  };
};