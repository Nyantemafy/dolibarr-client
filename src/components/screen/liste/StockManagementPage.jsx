import React, { useEffect } from 'react';
import { useStockManagement } from '../../../hooks/useStockManagement';
import Notification from '../../indicateur/Notification';

import StockHeader from '../../ui/stock/StockHeader';
import StockStats from '../../ui/stock/StockStats';
import StockFilters from '../../ui/stock/StockFilters';
import StockTable from '../../ui/stock/StockTable';
import ProductDetailsModal from '../../ui/stock/ProductDetailsModal';

const StockManagementPage = () => {
  const {
    loading,
    selectedProduct,
    searchTerm,
    filterStatus,
    sortConfig,
    filteredAndSortedData,
    statistics,
    loadStockData,
    viewProductDetails,
    handleSort,
    setSearchTerm,
    setFilterStatus,
    setSelectedProduct
  } = useStockManagement();

  // Correction: Chargement initial seulement au montage du composant
  useEffect(() => {
    loadStockData();
  }, []); // Tableau de dépendances vide pour exécuter seulement au montage

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <StockHeader
        onRefresh={loadStockData}
        loading={loading}
      />

      <StockStats statistics={statistics} />
      
      <StockFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterStatus}
      />

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Stocks des produits ({filteredAndSortedData.length})
          </h2>
        </div>
        
        <StockTable
          data={filteredAndSortedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          onViewDetails={viewProductDetails}
          loading={loading}
        />
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <Notification />
    </div>
  );
};

export default StockManagementPage;