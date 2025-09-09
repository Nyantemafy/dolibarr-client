import { useState, useMemo } from 'react';

export const useOrderFilters = (orders) => {
  const [filters, setFilters] = useState({
    status: '',
    ref: '',
    label: '',
    product: '',
    qtyMin: '',
    qtyMax: '',
    dateFrom: '',
    dateTo: ''
  });

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (filters.status !== '') {
      result = result.filter(order => order.status === parseInt(filters.status));
    }

    if (filters.ref) {
      result = result.filter(order => 
        order.ref.toLowerCase().includes(filters.ref.toLowerCase())
      );
    }

    if (filters.product) {
      result = result.filter(order => order.fk_product === parseInt(filters.product));
    }

    if (filters.qtyMin) {
      result = result.filter(order => order.qty >= parseInt(filters.qtyMin));
    }

    if (filters.qtyMax) {
      result = result.filter(order => order.qty <= parseInt(filters.qtyMax));
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.date_creation) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59);
      result = result.filter(order => new Date(order.date_creation) <= toDate);
    }

    return result;
  }, [orders, filters]);

  const resetFilters = () => {
    setFilters({
      status: '',
      ref: '',
      label: '',
      product: '',
      qtyMin: '',
      qtyMax: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return { filters, setFilters, filteredOrders, resetFilters };
};
