import React, { useState, useEffect, useMemo } from 'react';
import { useManufacturingOrders } from '../../../hooks/useManufacturingOrders';
import { useProducts } from '../../../hooks/useProducts';
import * as useOrderFilters from '../../../hooks/useOrderFilters';
import { useOrderSelection } from '../../../hooks/useOrderSelection';
import { useNotification } from '../../../hooks/useNotification';
import { ExportService } from '../../../services/exportService';

import OrdersHeader from '../../ui/order/OrdersHeader';
import OrdersStats from '../../ui/order/OrdersStats';
import SelectionActions from '../../ui/SelectionActions';
import OrdersFilters from '../../ui/order/OrdersFilters';
import OrdersTable from '../../ui/order/OrdersTable';
import OrderDetailModal from '../../ui/order/OrderDetailModal';
import ExportModal from '../../ui/ExportModal';
import Notification from '../../indicateur/Notification';
import Pagination from '../../ui/Pagination';

const ITEMS_PER_PAGE = 10;

const ManufacturingOrdersPage = ({ setActiveTab, setSelectedOrderId }) => {
  // Hooks personnalisés
  const { notification, showNotification, setNotification } = useNotification();
  const { 
    orders, 
    loading, 
    actionLoading, 
    loadOrders, 
    validateOrder, 
    produceOrder, 
    deleteOrders 
  } = useManufacturingOrders(showNotification);
  
  const { productLabels } = useProducts();
  const { filters, setFilters, filteredOrders, resetFilters } = useOrderFilters.useOrderFilters(orders);
  const { 
    selectedOrders, 
    selectAll, 
    toggleSelectAll, 
    toggleSelectOrder, 
    isOrderSelected, 
    clearSelection 
  } = useOrderSelection(filteredOrders);

  // États locaux (UI seulement)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [ordersToExport, setOrdersToExport] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Handlers
  const handleExportSelected = () => {
    const selectedIds = Array.from(selectedOrders);
    if (selectedIds.length === 0) {
      showNotification('Aucun ordre sélectionné', 'warning');
      return;
    }

    const ordersToExport = filteredOrders.filter(order => selectedIds.includes(order.id));
    setOrdersToExport(ordersToExport);
    setShowExportModal(true);
  };

  const handleExportFormat = (format) => {
    setShowExportModal(false);
    
    try {
      if (format === 'csv') {
        ExportService.exportToCSV(ordersToExport);
      } else if (format === 'pdf') {
        ExportService.exportToPDF(ordersToExport);
      } else if (format === 'pdf-table') {
        ExportService.exportToPDFWithTable(ordersToExport);
      }
      
      showNotification(`${ordersToExport.length} ordre(s) exporté(s) en ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Array.from(selectedOrders);
    if (selectedIds.length === 0) {
      showNotification('Aucun ordre sélectionné', 'warning');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} ordre(s) ?`)) {
      return;
    }

    const success = await deleteOrders(selectedIds);
    if (success) {
      clearSelection();
    }
  };

  // Effets
  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <OrdersHeader onRefresh={loadOrders} loading={loading} />
      
      {/* <OrdersStats orders={orders} /> */}
      
      <SelectionActions 
        selectedCount={selectedOrders.size}
        onExport={handleExportSelected}
        onDelete={handleDeleteSelected}
        deleteLoading={actionLoading.delete}
      />
      
      <OrdersFilters 
        filters={filters}
        setFilters={setFilters}
        productLabels={productLabels}
        onResetFilters={resetFilters}
      />
      
      <OrdersTable
        orders={paginatedOrders}
        allOrders={orders}
        selectedOrders={selectedOrders}
        selectAll={selectAll}
        loading={loading}
        actionLoading={actionLoading}
        onSelectOrder={toggleSelectOrder}
        onSelectAll={toggleSelectAll}
        onValidate={validateOrder}
        onProduce={produceOrder}
        onViewDetails={setSelectedOrder}
        isOrderSelected={isOrderSelected}
        setActiveTab={setActiveTab}
        setSelectedOrderId={setSelectedOrderId}
      />
      
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          actionLoading={actionLoading}
          onClose={() => setSelectedOrder(null)}
          onValidate={validateOrder}
          onProduce={produceOrder}
        />
      )}
      
      {showExportModal && (
        <ExportModal
          ordersCount={ordersToExport.length}
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

export default ManufacturingOrdersPage;