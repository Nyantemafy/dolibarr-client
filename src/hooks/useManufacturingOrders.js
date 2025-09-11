import { useState, useCallback } from 'react';
import { ManufacturingService } from '../services/manufacturingService';

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
      const order = await ManufacturingService.getOrderById(orderId);
      setOrder(order);
      return order;
    } catch (error) {
      showNotification('Erreur lors du chargement de l\'ordre', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const ordersData = await ManufacturingService.getOrders();
      setOrders(ordersData || []);
    } catch (error) {
      showNotification(
        'Erreur lors du chargement des ordres de fabrication: ' + error.message,
        'error'
      );
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const validateOrder = useCallback(async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: true }));
      await ManufacturingService.validateOrder(orderId);
      
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
  }, [showNotification]);

  const produceOrder = useCallback(async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: true }));
      await ManufacturingService.produceOrder(orderId);

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
  }, [showNotification]);

  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      setLoading(true);
      const response = await ManufacturingService.updateOrder(orderId, updateData);
      console.log(response);
      
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
  }, [showNotification]);

  const deleteOrders = useCallback(async (orderIds) => {
    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      await Promise.all(
        orderIds.map(id => ManufacturingService.deleteOrder(id))
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
  }, [showNotification]);

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
