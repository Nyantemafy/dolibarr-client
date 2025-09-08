import React, { useEffect, useState } from 'react';
import apiService from '../../service/apiService';
import { RefreshCw, ArrowLeft, Package, Calendar, Factory, ClipboardList, Box, Clock, User, FileText, Layers } from 'lucide-react';

const statusLabels = {
  0: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 border border-gray-300', icon: '📝' },
  1: { label: 'Validé', color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: '✅' },
  2: { label: 'En cours', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: '⚙️' },
  3: { label: 'Fabriqué', color: 'bg-green-50 text-green-700 border border-green-200', icon: '🏭' }
};

const ManufacturingOrderDetail = ({ orderId, setActiveTab }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/manufacturing/getById/${orderId}`);
      console.log(response.data?.data || response.data);
      setOrder(response.data?.data || response.data);
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

  const statusConfig = statusLabels[order.status] || statusLabels[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Factory className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ordre {order.ref}</h1>
              <p className="text-gray-600">{order.label}</p>
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
                  <p className="text-gray-900 font-medium">{order.ref}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Libellé</p>
                  <p className="text-gray-900">{order.label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nomenclature</p>
                  <p className="text-gray-900 font-medium">{order.bom?.ref || '—'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produit à fabriquer</p>
                  <p className="text-gray-900 font-medium">
                    {order.product?.ref || '—'} - {order.product?.label || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantité</p>
                  <p className="text-gray-900 font-medium text-xl">{order.qty} unités</p>
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
                  <p className="text-sm text-gray-600">Créé le</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(order.date_creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {order.date_start_planned && (
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-3 text-gray-500" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Début prévu</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(order.date_start_planned).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
              
              {order.date_end_planned && (
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-3 text-gray-500" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Fin prévue</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(order.date_end_planned).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
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
          
          {order.components && order.components.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité requise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.components.map((component, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {component.product?.ref || component.fk_product}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {component.product?.label || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {component.qty}
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Imprimer
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Exporter en PDF
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingOrderDetail;