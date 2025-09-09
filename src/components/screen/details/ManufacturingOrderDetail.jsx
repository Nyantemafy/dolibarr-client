import React, { useEffect, useState } from 'react';
import apiService from '../../service/apiService';
import html2pdf from 'html2pdf.js';
import { RefreshCw, ArrowLeft, Package, Calendar, Factory, ClipboardList, Box, Clock, FileText, Layers, Edit, Save, X } from 'lucide-react';

const statusLabels = {
  0: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 border border-gray-300', icon: '📝' },
  1: { label: 'Validé', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '✅' },
  2: { label: 'En cours', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: '⚙️' },
  3: { label: 'Fabriqué', color: 'bg-green-50 text-green-700 border border-green-200', icon: '🏭' }
};

const ManufacturingOrderDetail = ({ orderId, setActiveTab }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [boms, setBoms] = useState([]);

  const componentsToDisplay = isEditing ? (editedOrder?.components || []) : (order?.components || []);

    const handleBOMChange = async (bomId) => {
        
        if (!bomId) return;

        const selectedBOM = boms.find(b => b.id === Number(bomId));

        try {
            const response = await apiService.get(`/api/boms/${bomId}/with-components`);
            
            const fullBOM = response?.data || selectedBOM;
            
            setEditedOrder(prev => ({
            ...prev,
            bom: {
                id: fullBOM.id,
                ref: fullBOM.ref,
                label: fullBOM.label
            },
            product: {
                id: fullBOM.product?.id || selectedBOM?.product_id,
                ref: fullBOM.product?.ref || selectedBOM?.product_ref,
                label: fullBOM.product?.label || selectedBOM?.product_label || fullBOM.product?.ref
            },
            components: fullBOM.components?.map(line => ({
                ...line,
                product: line.product || {
                id: line.fk_product,
                ref: line.product_ref || `PROD_${line.fk_product}`,
                label: line.product_label || `Produit ${line.fk_product}`
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
                label: selectedBOM?.product_label || selectedBOM?.product_ref
            },
            components: prev?.components || []
            }));
        }
    };

  useEffect(() => {
    const loadBoms = async () => {
      try {
        const response = await apiService.get('/api/boms/liste');
        setBoms(response?.data || []);
      } catch (error) {
        console.error("Erreur chargement BOMs :", error);
      }
    };
    loadBoms();
  }, []);

  const exportToPDF = () => {
    const content = document.getElementById('order-detail-content');
    const opt = {
      margin: 10,
      filename: `ordre_fabrication_${order?.ref || 'inconnu'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(content).save();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOrder({
      ...order,
      date_creation: order?.date_creation ? new Date(order.date_creation).toISOString().split('T')[0] : '',
      date_start_planned: order?.date_start_planned ? new Date(order.date_start_planned).toISOString().split('T')[0] : '',
      date_end_planned: order?.date_end_planned ? new Date(order.date_end_planned).toISOString().split('T')[0] : '',
    });
  };

  const handleSave = async () => {
    if (!editedOrder) return;

    try {
      setLoading(true);

      const updateData = {
        qty: Number(editedOrder?.qty || 0),
        bom_id: editedOrder?.bom?.id || null,
        date_start_planned: editedOrder?.date_start_planned || null,
        date_end_planned: editedOrder?.date_end_planned || null,
        date_creation: editedOrder?.date_creation || null,
      };

      const response = await apiService.put(`/api/manufacturing/update/${orderId}`, updateData);

      if (response?.success) {
        setOrder(prev => ({
          ...prev,
          ...editedOrder
        }));
        setIsEditing(false);
        console.log("Ordre mis à jour avec succès");
      } else {
        console.error("Erreur mise à jour:", response?.error || "Inconnu");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOrder(null);
  };

  const handleChange = (field, value) => {
    setEditedOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/manufacturing/getById/${orderId}`);
      setOrder(response?.data?.data || response?.data || null);
    } catch (error) {
      console.error("Erreur chargement ordre:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
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
            <ArrowLeft className="mr-2" size={16} />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = statusLabels[order?.status] || statusLabels[0];

  return (
    <div id="order-detail-content" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Factory className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ordre {order?.ref || '—'}</h1>
              <p className="text-gray-600">{order?.label || '—'}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}>
              <span className="mr-2 text-lg">{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="mr-2" size={16} />
              Retour
            </button>
          </div>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Informations générales */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-500" size={20} />
              Informations générales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Référence</p>
                  <p className="text-gray-900 font-medium">{order?.ref || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nomenclature</p>
                  {isEditing ? (
                    <select
                    value={editedOrder?.bom?.id || ''}
                    onChange={(e) => handleBOMChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">— Choisir une BOM —</option>
                        {boms.map((b) => (
                            <option key={b.id} value={b.id}>
                            {b.ref} - {b.label}
                            </option>
                        ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{order?.bom?.ref || '—'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produit à fabriquer</p>
                  <p className="text-gray-900 font-medium">
                    {(editedOrder?.product?.ref || order?.product?.ref || '—')} - {(editedOrder?.product?.label || order?.product?.label || '—')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantité</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedOrder?.qty || ''}
                      onChange={(e) => handleChange('qty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-xl">{order?.qty || 0} unités</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="mr-2 text-blue-500" size={20} />
              Planning
            </h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="mr-3 text-gray-500" size={18} />
                <div>
                  <label className="text-sm text-gray-600">Créé le</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedOrder?.date_creation || ''}
                      onChange={(e) => handleChange('date_creation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {order?.date_creation ? new Date(order.date_creation).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="mr-3 text-gray-500" size={18} />
                <div>
                  <label className="text-sm text-gray-600">Début prévu</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedOrder?.date_start_planned || ''}
                      onChange={(e) => handleChange('date_start_planned', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {order?.date_start_planned ? new Date(order.date_start_planned).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="mr-3 text-gray-500" size={18} />
                <div>
                  <label className="text-sm text-gray-600">Fin prévue</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedOrder?.date_end_planned || ''}
                      onChange={(e) => handleChange('date_end_planned', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {order?.date_end_planned ? new Date(order.date_end_planned).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composants */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Layers className="mr-2 text-blue-500" size={20} />
              Composants nécessaires
            </h2>
            <p className="text-sm text-gray-600">Liste des matières premières et composants</p>
          </div>

          {componentsToDisplay.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité requise</th>
                  </tr>
                </thead>
                <tbody>
                  {componentsToDisplay.map((component, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                        {component?.product?.ref || component?.product_ref || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {component?.product?.label || component?.product_label || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {/* Calculer la quantité totale en multipliant par la quantité de l'OF */}
                        {(component?.qty || 0) * (isEditing ? editedOrder?.qty : order?.qty || 1)}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package className="mx-auto mb-2 text-gray-400" size={48} />
              <p className="text-gray-600">Aucun composant listé</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FileText className="mr-2" size={16} />
              Exporter en PDF
            </button>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Edit className="mr-2" size={16} />
                Modifier
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400"
                >
                  <Save className="mr-2" size={16} />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X className="mr-2" size={16} />
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingOrderDetail;
