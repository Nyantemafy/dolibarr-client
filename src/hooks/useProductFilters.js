import { useState, useMemo } from 'react';

export const useProductFilters = (products) => {
  const [filters, setFilters] = useState({
    ref: '',
    label: '',
    priceMin: '',
    priceMax: '',
    warehouse: '', 
    finished: ''
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtre par référence
    if (filters.ref) {
      result = result.filter(product => 
        product.ref.toLowerCase().includes(filters.ref.toLowerCase())
      );
    }

    // Filtre par label/désignation
    if (filters.label) {
      result = result.filter(product => 
        product.label.toLowerCase().includes(filters.label.toLowerCase())
      );
    }

    // Filtre par prix minimum
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      result = result.filter(product => 
        product.price && product.price >= minPrice
      );
    }

    // Filtre par prix maximum
    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      result = result.filter(product => 
        product.price && product.price <= maxPrice
      );
    }

    // Filtre par entrepôt
    if (filters.warehouse) {
      result = result.filter(product => String(product.fk_default_warehouse) === filters.warehouse);
    }

    // Filtre par type de produit
    if (filters.finished !== '') {
      result = result.filter(product => String(product.finished) === filters.finished);
    }

    return result;
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({
      ref: '',
      label: '',
      priceMin: '',
      priceMax: '',
      entrepo: '',
      type: ''
    });
  };

  return { filters, setFilters, filteredProducts, resetFilters };
};