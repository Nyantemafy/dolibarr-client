import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, ClipboardList } from 'lucide-react';
import { useManufacturingOrders } from '../../../hooks/useManufacturingOrders';
import { useBOMs } from '../../../hooks/useBOMs';
import { exportDetailsService } from '../../../services/exportDetailsService';
import apiService from '../../service/apiService';

import OrderHeaderDetaille from '../../ui/order/OrderHeaderDetaille';
import OrderGeneralInfo from '../../ui/order/OrderGeneralInfo';
import OrderPlanning from '../../ui/order/OrderPlanning';
import OrderComponents from '../../ui/order/OrderComponents';
import OrderActions from '../../ui/order/OrderActions';

const ManufacturingOrderDetail = ({ orderId, setActiveTab }) => {
  const { order, loading, setOrder, updateOrder, getById } = useManufacturingOrders(); 
  const { boms } = useBOMs();
  const [bom, setBom] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      getById(orderId);
    }
  }, [orderId, getById]);

  useEffect(() => {
    if (order) {
      console.log("🟢 Order reçu :", order);
      setBom(order?.bom);
    }
  }, [order]);

  const handleBOMChange = async (bomId) => {
    if (!bomId) return;

    const selectedBOM = boms.find(b => b.id === Number(bomId));

    try {
      const response = await apiService.get(`/api/boms/${bomId}/with-components`);
      const fullBOM = response?.data || selectedBOM;

      const product = fullBOM.product
        ? {
            id: fullBOM.product.id,
            ref: fullBOM.product.ref,
            label: fullBOM.product.label || fullBOM.product.ref,
          }
        : {
            id: fullBOM.product_id,
            ref: fullBOM.product_ref,
            label: fullBOM.product_label || fullBOM.product_ref,
          };

      setEditedOrder(prev => ({
        ...prev,
        bom: {
          id: fullBOM.id,
          ref: fullBOM.ref,
          label: fullBOM.label,
        },
        product,
        components: fullBOM.components?.map(line => ({
          ...line,
          product: line.product || {
            id: line.fk_product,
            ref: line.product_ref || `PROD_${line.fk_product}`,
            label: line.product_label || `Produit ${line.fk_product}`,
          }
        })) || []
      }));
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du BOM complet:", error);

      setEditedOrder(prev => ({
        ...prev,
        bom: selectedBOM,
        product: {
          id: selectedBOM?.product_id,
          ref: selectedBOM?.product_ref,
          label: selectedBOM?.product_label || selectedBOM?.product_ref,
        },
        components: prev?.components || []
      }));
    }
  };

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditedOrder({
      ...order,
      date_start_planned: order?.date_start_planned ? new Date(order.date_start_planned).toISOString().split('T')[0] : '',
      date_end_planned: order?.date_end_planned ? new Date(order.date_end_planned).toISOString().split('T')[0] : '',
    });
  }, [order]);

  const handleSave = useCallback(async () => {
    if (!editedOrder) return;

    const updateData = {
      qty: Number(editedOrder.qty || 0),
      fk_bom: editedOrder.bom?.id || undefined,
      ...(editedOrder.date_start_planned ? { date_start_planned: editedOrder.date_start_planned } : {}),
      ...(editedOrder.date_end_planned ? { date_end_planned: editedOrder.date_end_planned } : {})
    };

    const result = await updateOrder(orderId, updateData); 
    if (result.success) {
      setOrder(prev => ({
        ...prev,
        bom: editedOrder.bom,
        product: editedOrder.product,
        components: editedOrder.components,
      }));

      setIsEditing(false);
    }

  }, [editedOrder, updateOrder, orderId]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedOrder(null);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setEditedOrder(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExport = useCallback(() => {
    exportDetailsService.exportOrderToPDF(order);
  }, [order]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
          <p className="text-gray-600 text-lg">Chargement des détails de l'ordre...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-lg">Aucun détail d'ordre trouvé</p>
          <button
            onClick={() => setActiveTab('orders')}
            className="mt-4 flex items-center justify-center mx-auto bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="order-detail-content" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <OrderHeaderDetaille 
          order={order} 
          onBack={() => setActiveTab('orders')} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <OrderGeneralInfo
            order={order}
            editedOrder={editedOrder}
            isEditing={isEditing}
            boms={boms}
            onBOMChange={handleBOMChange}
            onFieldChange={handleFieldChange}
          />

          <OrderPlanning
            order={order}
            editedOrder={editedOrder}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        </div>

        <OrderComponents
          components={isEditing ? editedOrder?.components : order?.components}
          orderQty={order?.qty}
          editedOrder={editedOrder}
          isEditing={isEditing}
          bom={bom}
        />

        <OrderActions
          onExport={handleExport}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={isEditing}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManufacturingOrderDetail;
