import { useState } from 'react';

export const useOrderSelection = (filteredOrders) => {
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      const allIds = new Set(filteredOrders.map(order => order.id));
      setSelectedOrders(allIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    
    if (newSelected.size === filteredOrders.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
    setSelectAll(false);
  };

  const isOrderSelected = (orderId) => selectedOrders.has(orderId);

  return {
    selectedOrders,
    selectAll,
    toggleSelectAll,
    toggleSelectOrder,
    isOrderSelected,
    clearSelection
  };
};
