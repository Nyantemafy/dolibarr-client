import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, ClipboardList } from 'lucide-react';
import { useManufacturingOrders } from '../../../hooks/useManufacturingOrders';
import { useProducts } from '../../../hooks/useProducts';
import { exportDetailsService } from '../../../services/exportDetailsService';

import OrderHeaderDetaille from '../../ui/order/OrderHeaderDetaille';
import OrderGeneralInfo from '../../ui/order/OrderGeneralInfo';
import OrderPlanning from '../../ui/order/OrderPlanning';
import OrderComponents from '../../ui/order/OrderComponents';
import OrderActions from '../../ui/order/OrderActions';

const ManufacturingOrderDetail = ({ orderId, setActiveTab }) => {
  const { order, loading, setOrder, updateOrder, getById } = useManufacturingOrders(); 
  const { finishedProducts } = useProducts();
  const [bom, setBom] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      getById(orderId);
    }
  }, [orderId, getById]);

  useEffect(() => {
    if (order && finishedProducts.length > 0) {
      console.log("🟢 Product reçu :", finishedProducts);
      setBom(order?.bom);
    }
  }, [order]);

  const handleBOMChange = async (productId) => {
    if (!productId) return;

    const selectedProduct = finishedProducts.find(
      (p) => String(p.id) === String(productId)
    );

    console.log('📦 Produit sélectionné:', selectedProduct);
    console.log('🏭 BOMs disponibles:', selectedProduct?.boms);
    console.log('🔧 Composants disponibles:', selectedProduct?.bom?.lines);

    try {
      // Trouver le produit avec ses BOM dans finishedProducts
      const productWithBom = finishedProducts.find(p => String(p.id) === String(productId));
      
      if (productWithBom && productWithBom.boms && productWithBom.boms.length > 0) {
        // Prendre la première BOM (ou vous pourriez laisser choisir)
        const mainBom = productWithBom.boms[0];
        
        // // Extraire les composants de la BOM
        // const components = mainBom.lines ? mainBom.lines.map(line => ({
        //   id: line.id,
        //   fk_product: line.fk_product,
        //   qty: line.qty,
        //   product: {
        //     id: line.fk_product,
        //     ref: line.product_ref || `PROD_${line.fk_product}`,
        //     label: line.product_label || `Produit ${line.fk_product}`,
        //   }
        // })) : [];

        setEditedOrder(prev => ({
          ...prev,
          product: {
            id: productWithBom.id,
            ref: productWithBom.ref,
            label: productWithBom.label
          },
          bom: {
            id: mainBom.id,
            ref: mainBom.ref,
            label: mainBom.label
          }
        }));
      } else {
        // Fallback si pas de BOM trouvée
        setEditedOrder(prev => ({
          ...prev,
          product: {
            id: selectedProduct.id,
            ref: selectedProduct.ref,
            label: selectedProduct.label
          }
        }));
      }

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des composants:", error);
      
      setEditedOrder(prev => ({
        ...prev,
        product: {
          id: selectedProduct.id,
          ref: selectedProduct.ref,
          label: selectedProduct.label
        }
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
        fk_bom: editedOrder.bom,
        product: editedOrder.product,
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
            products={finishedProducts || []}
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
