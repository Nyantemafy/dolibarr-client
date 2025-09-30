import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { useProductFilters } from '../../../hooks/useProductFilters';
import { useProductSelection } from '../../../hooks/useProductSelection';
import { useNotification } from '../../../hooks/useNotification';
import { ExportService } from '../../../services/exportService';

import GenericHeader from '../../ui/general/GenericHeader';

import ProductStats from '../../ui/product/ProductStats';
import SelectionActions from '../../ui/SelectionActions';
import ProductsFilters from '../../ui/product/ProductsFilters';
import ProductTable from '../../ui/product/ProductTable';
import ProductDetailModal from '../../ui/product/ProductDetailModal';
import ExportModal from '../../ui/ExportModal';
import Notification from '../../indicateur/Notification';
import Pagination from '../../ui/Pagination';

const ITEMS_PER_PAGE = 10;

const ProductsManagementPage = ({ setActiveTab, setSelectedProductId }) => {
  // Hooks personnalisés
  const { notification, showNotification, setNotification } = useNotification();
  const { 
    productLabels, 
    finishedProducts,
    loading, 
    actionLoading, 
    loadProducts, 
    deleteProduct,
    updateProduct
  } = useProducts(showNotification);
  
  const { filters, setFilters, filteredProducts, resetFilters } = useProductFilters(productLabels);
  const { 
    selectedProducts, 
    selectAll, 
    toggleSelectAll, 
    toggleSelectProduct, 
    isProductSelected, 
    clearSelection 
  } = useProductSelection(filteredProducts);

  // États locaux (UI seulement)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [productsToExport, setProductsToExport] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Handlers
  const handleExportSelected = () => {
    const selectedIds = Array.from(selectedProducts);
    if (selectedIds.length === 0) {
      showNotification('Aucun produit sélectionné', 'warning');
      return;
    }

    const productsToExport = filteredProducts.filter(product => selectedIds.includes(product.id));
    setProductsToExport(productsToExport);
    setShowExportModal(true);
  };

  const handleExportFormat = (format) => {
    setShowExportModal(false);
    
    try {
      if (format === 'csv') {
        ExportService.exportProductsToCSV(productsToExport);
      } else if (format === 'pdf') {
        ExportService.exportProductsToPDF(productsToExport);
      }
      
      showNotification(`${productsToExport.length} produit(s) exporté(s) en ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Array.isArray(selectedProducts) 
    ? selectedProducts 
    : [selectedProducts];
    console.log(selectedIds)
 
    if (selectedIds.length === 0) {
      showNotification('Aucun produit sélectionné', 'warning');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} produit(s) ?`)) {
      return;
    }

    const success = await deleteProduct(selectedIds);
    if (success) {
      clearSelection();
    }
  };

  const handleEditProduct = (product) => {
    console.log('Édition du produit:', product);
    setSelectedProductId(product.id);
    setActiveTab('product-update');
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  // Effets
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <GenericHeader
        onRefresh={loadProducts}
        loading={loading}
        title="Gestion des Produits"
        subtitle="Catalogue et gestion des produits"
        buttonText="Actualiser"
      />
      
      {/* <ProductStats products={productLabels} /> */}
      
      <SelectionActions 
        selectedCount={selectedProducts.size}
        onExport={handleExportSelected}
        onDelete={handleDeleteSelected}
        deleteLoading={actionLoading.delete}
      />
      
      <ProductsFilters 
        filters={filters}
        setFilters={setFilters}
        onResetFilters={resetFilters}
      />
      
      <ProductTable
        products={paginatedProducts}
        allProducts={productLabels}
        selectAll={selectAll}
        loading={loading}
        actionLoading={actionLoading}
        onSelectProduct={toggleSelectProduct}
        onSelectAll={toggleSelectAll}
        onEdit={handleEditProduct}
        onDelete={deleteProduct}
        onViewDetails={handleViewDetails}
        isProductSelected={isProductSelected}
        setActiveTab={setActiveTab}
        setSelectedProductId={setSelectedProductId}
      />
      
      {selectedProduct && (
        <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
            actionLoading={actionLoading} 
        />
        )}
      
      {showExportModal && (
        <ExportModal
          itemsCount={productsToExport.length}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportFormat}
        />
      )}
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
        />
      )}

    </div>
  );
};

export default ProductsManagementPage;