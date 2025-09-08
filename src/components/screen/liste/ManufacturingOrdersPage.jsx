import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Play, AlertCircle, Eye, Calendar, Package, Factory } from 'lucide-react';
import apiService from '../../service/apiService';
import Notification from '../../indicateur/Notification'; 

const ManufacturingOrdersPage = ({ setActiveTab, setSelectedOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productLabels, setProductLabels] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    ref: '',
    label: '',
    product: '',
    qtyMin: '',
    qtyMax: '',
    dateFrom: '',
    dateTo: ''
  });
  const [filteredOrders, setFilteredOrders] = useState([]);

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
      console.log(response.data);
      setOrders(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des ordres de fabrication: ' + error.message, 'error');
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await apiService.get('/api/products/liste');
      console.log(response.data);
      setProductLabels(response.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
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

  const applyFilters = () => {
    let result = [...orders];

    // Filtre par statut
    if (filters.status !== '') {
      result = result.filter(order => order.status === parseInt(filters.status));
    }

    // Filtre par référence
    if (filters.ref) {
      result = result.filter(order => 
        order.ref.toLowerCase().includes(filters.ref.toLowerCase())
      );
    }

    // Filtre par libellé
    if (filters.label) {
      result = result.filter(order => 
        order.label.toLowerCase().includes(filters.label.toLowerCase())
      );
    }

    // Filtre par produit
    if (filters.product) {
      result = result.filter(order => order.fk_product === parseInt(filters.product));
    }

    // Filtre par quantité minimale
    if (filters.qtyMin) {
      result = result.filter(order => order.qty >= parseInt(filters.qtyMin));
    }

    // Filtre par quantité maximale
    if (filters.qtyMax) {
      result = result.filter(order => order.qty <= parseInt(filters.qtyMax));
    }

    // Filtre par date de création
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.date_creation) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // Inclure toute la journée
      result = result.filter(order => new Date(order.date_creation) <= toDate);
    }

    setFilteredOrders(result);
  };

  // Mettre à jour les résultats filtrés quand les commandes ou les filtres changent
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  useEffect(() => {
    loadOrders();
    loadProduct();
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

      {/* Filtres multicritères */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              {Object.entries(statusLabels).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              type="text"
              value={filters.ref}
              onChange={(e) => setFilters({...filters, ref: e.target.value})}
              placeholder="Filtrer par référence"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
            <input
              type="text"
              value={filters.label}
              onChange={(e) => setFilters({...filters, label: e.target.value})}
              placeholder="Filtrer par libellé"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produits</label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({...filters, product: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les produits</option>
              {productLabels.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité min</label>
            <input
              type="number"
              value={filters.qtyMin}
              onChange={(e) => setFilters({...filters, qtyMin: e.target.value})}
              placeholder="Quantité minimale"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité max</label>
            <input
              type="number"
              value={filters.qtyMax}
              onChange={(e) => setFilters({...filters, qtyMax: e.target.value})}
              placeholder="Quantité maximale"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (début)</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (fin)</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bouton réinitialiser */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              status: '',
              ref: '',
              label: '',
              product: '',
              qtyMin: '',
              qtyMax: '',
              dateFrom: '',
              dateTo: ''
            })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Réinitialiser les filtres
          </button>
        </div>
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
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Factory className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">
              {orders.length === 0 ? 'Aucun ordre de fabrication trouvé' : 'Aucun résultat ne correspond aux filtres'}
            </p>
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
                {filteredOrders.map((order) => {
                  const statusConfig = statusLabels[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td 
                        className="px-4 py-3 cursor-pointer text-blue-600 hover:underline"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setActiveTab('order-detail');
                        }}
                      >
                        <div className="font-medium">{order.ref}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-gray-900">{order.label}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">
                          <div className="font-medium">{order.product_ref}</div>
                          <div className="text-sm text-gray-600">{order.product?.label}</div>
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

      {/* Dans l'en-tête de la table, remplacez ou ajoutez */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Liste des ordres</h2>
          {filteredOrders.length !== orders.length && (
            <p className="text-sm text-gray-600">
              {filteredOrders.length} résultat(s) sur {orders.length}
            </p>
          )}
        </div>
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