import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Play, AlertCircle, Eye, Calendar, Package, Factory } from 'lucide-react';
import apiService from '../../service/apiService';
import Notification from '../../indicateur/Notification'; 

const ManufacturingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusLabels = {
    0: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: '📝' },
    1: { label: 'Validé', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    2: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
    3: { label: 'Fabriqué', color: 'bg-green-100 text-green-800', icon: '🏭' }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/manufacturing/liste');
      setOrders(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des ordres de fabrication: ' + error.message, 'error');
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: true }));
      
      // Appel API pour valider l'ordre avec votre route POST
      await apiService.post(`/api/manufacturing/validation/${orderId}`);
      
      // Mise à jour locale
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 1 } : order
      ));
      
      showNotification('Ordre de fabrication validé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la validation: ' + error.message, 'error');
      console.error('Erreur validation:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: false }));
    }
  };

  const produceOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: true }));
      
      // Appel API pour consommer et produire avec votre route POST
      await apiService.post(`/api/manufacturing/produire/${orderId}`);

      // Mise à jour locale
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 3 } : order
      ));
      
      showNotification('Production terminée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la production: ' + error.message, 'error');
      console.error('Erreur production:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: false }));
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordres de Fabrication</h1>
          <p className="text-gray-600">Gestion des ordres de fabrication et suivi de production</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
          Actualiser
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusLabels).map(([status, config]) => {
          const count = orders.filter(order => order.status === parseInt(status)).length;
          return (
            <div key={status} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-2xl">{config.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table des ordres */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des ordres</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-gray-600">Chargement des ordres...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Factory className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">Aucun ordre de fabrication trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Libellé</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Produit</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Quantité</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">État</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date création</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusConfig = statusLabels[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{order.ref}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{order.label}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">
                          <div className="font-medium">{order.product_ref}</div>
                          <div className="text-sm text-gray-600">{order.product_label}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium">{order.qty}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <span className="mr-1">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1" size={14} />
                          {new Date(order.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Bouton Voir */}
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Bouton Valider (si brouillon) */}
                          {order.status === 0 && (
                            <button
                              onClick={() => validateOrder(order.id)}
                              disabled={actionLoading[`validate_${order.id}`]}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                              title="Valider l'ordre"
                            >
                              {actionLoading[`validate_${order.id}`] ? (
                                <RefreshCw className="animate-spin" size={12} />
                              ) : (
                                <>
                                  <Check size={12} className="mr-1" />
                                  Valider
                                </>
                              )}
                            </button>
                          )}

                          {/* Bouton Produire (si validé) */}
                          {order.status === 1 && (
                            <button
                              onClick={() => produceOrder(order.id)}
                              disabled={actionLoading[`produce_${order.id}`]}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:bg-gray-400 flex items-center"
                              title="Produire (consommer et produire tout)"
                            >
                              {actionLoading[`produce_${order.id}`] ? (
                                <RefreshCw className="animate-spin" size={12} />
                              ) : (
                                <>
                                  <Play size={12} className="mr-1" />
                                  Produire
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de l'ordre de fabrication
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence</label>
                    <p className="text-gray-900 font-medium">{selectedOrder.ref}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">État</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[selectedOrder.status].color}`}>
                      <span className="mr-1">{statusLabels[selectedOrder.status].icon}</span>
                      {statusLabels[selectedOrder.status].label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Libellé</label>
                  <p className="text-gray-900">{selectedOrder.label}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produit à fabriquer</label>
                    <p className="text-gray-900">
                      <span className="font-medium">{selectedOrder.product_ref}</span>
                      <br />
                      <span className="text-sm text-gray-600">{selectedOrder.product_label}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantité</label>
                    <p className="text-gray-900 font-medium">{selectedOrder.qty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de création</label>
                    <p className="text-gray-900">{new Date(selectedOrder.date_creation).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date prévue</label>
                    <p className="text-gray-900">{new Date(selectedOrder.date_start_planned).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomenclature</label>
                  <p className="text-gray-900">{selectedOrder.bom_ref}</p>
                </div>

                {/* Actions dans le modal */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedOrder.status === 0 && (
                    <button
                      onClick={() => {
                        validateOrder(selectedOrder.id);
                        setSelectedOrder(prev => ({ ...prev, status: 1 }));
                      }}
                      disabled={actionLoading[`validate_${selectedOrder.id}`]}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      {actionLoading[`validate_${selectedOrder.id}`] ? (
                        <RefreshCw className="animate-spin mr-2" size={16} />
                      ) : (
                        <Check className="mr-2" size={16} />
                      )}
                      Valider
                    </button>
                  )}

                  {selectedOrder.status === 1 && (
                    <button
                      onClick={() => {
                        produceOrder(selectedOrder.id);
                        setSelectedOrder(prev => ({ ...prev, status: 3 }));
                      }}
                      disabled={actionLoading[`produce_${selectedOrder.id}`]}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      {actionLoading[`produce_${selectedOrder.id}`] ? (
                        <RefreshCw className="animate-spin mr-2" size={16} />
                      ) : (
                        <Play className="mr-2" size={16} />
                      )}
                      Produire
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ManufacturingOrdersPage;