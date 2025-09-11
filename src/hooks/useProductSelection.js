import { useState } from 'react';

export const useProductSelection = (filteredProducts) => {
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(filteredProducts.map(product => product.id));
      setSelectedProducts(allIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    
    if (newSelected.size === filteredProducts.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
    setSelectAll(false);
  };

  const isProductSelected = (productId) => selectedProducts.has(productId);

  return {
    selectedProducts,
    selectAll,
    toggleSelectAll,
    toggleSelectProduct,
    isProductSelected,
    clearSelection
  };
};