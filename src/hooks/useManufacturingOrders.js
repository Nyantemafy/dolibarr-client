import { useState, useCallback } from 'react';
import apiService from '../components/service/apiService';

export const useManufacturingOrders = (showNotification) => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const getById = useCallback(async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(`/api/manufacturing/getById/${orderId}`);
      setOrder(response?.data?.data || response?.data || null);
    } catch (err) {
      setError(err.message);
      console.error("Erreur chargement ordre:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/manufacturing/liste');
      setOrders(response.data || []);
    } catch (error) {
      showNotification(
        'Erreur lors du chargement des ordres de fabrication: ' + error.message,
        'error'
      );
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: true }));
      await apiService.post(`/api/manufacturing/validation/${orderId}`);
      
      setOrders(prev =>
        prev.map(order => 
          order.id === orderId ? { ...order, status: 1 } : order
        )
      );
      
      showNotification('Ordre de fabrication validé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la validation: ' + error.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: false }));
    }
  };

  const produceOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: true }));
      await apiService.post(`/api/manufacturing/produire/${orderId}`);

      setOrders(prev =>
        prev.map(order => 
          order.id === orderId ? { ...order, status: 3 } : order
        )
      );
      
      showNotification('Production terminée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la production: ' + error.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: false }));
    }
  };

  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/api/manufacturing/update/${orderId}`, updateData);
      
      if (response?.success) {
        setOrder(prev => ({ ...prev, ...updateData }));
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, ...updateData } : o))
        );
        return { success: true };
      } else {
        throw new Error(response?.error || "Erreur inconnue");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrders = async (orderIds) => {
    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      await Promise.all(
        orderIds.map(id => apiService.delete(`/api/manufacturing/delete/${id}`))
      );
      
      setOrders(prev => prev.filter(order => !orderIds.includes(order.id)));
      showNotification(`${orderIds.length} ordre(s) supprimé(s) avec succès`, 'success');
      
      return true;
    } catch (error) {
      showNotification('Erreur lors de la suppression: ' + error.message, 'error');
      return false;
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return {
    orders,
    order,
    loading,
    actionLoading,
    error,
    loadOrders,
    validateOrder,
    produceOrder,
    deleteOrders,
    setOrders,
    setOrder,
    getById,
    updateOrder
  };
};
