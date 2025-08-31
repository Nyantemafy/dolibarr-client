import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, TrendingUp, TrendingDown, Eye, AlertTriangle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import apiService from '../../service/apiService';
import Notification from '../../indicateur/Notification'; 

const StockManagementPage = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStockStatus = (stockFinal) => {
    if (stockFinal <= 0) return { label: 'Rupture', color: 'bg-red-100 text-red-800', icon: '🚨' };
    if (stockFinal <= 5) return { label: 'Faible', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    if (stockFinal <= 20) return { label: 'Moyen', color: 'bg-blue-100 text-blue-800', icon: '📦' };
    return { label: 'Bon', color: 'bg-green-100 text-green-800', icon: '✅' };
  };

  const loadStockData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/stock/liste');
      setStockData(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des stocks: ' + error.message, 'error');
      console.error('Erreur chargement stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductMovements = async (productId) => {
    try {
      const response = await apiService.get(`/api/stock/movements/${productId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
      return [];
    }
  };

  const viewProductDetails = async (product) => {
    const movements = await loadProductMovements(product.id);
    setSelectedProduct({ ...product, movements });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrage et tri des données
  const filteredAndSortedData = React.useMemo(() => {
    let filtered = stockData;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.product_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_label?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        const status = getStockStatus(item.stock_final);
        return status.label.toLowerCase() === filterStatus;
      });
    }

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [stockData, searchTerm, filterStatus, sortConfig]);

  // Statistiques
  const stats = React.useMemo(() => {
    const total = stockData.length;
    const rupture = stockData.filter(item => item.stock_final <= 0).length;
    const faible = stockData.filter(item => item.stock_final > 0 && item.stock_final <= 5).length;
    const totalValue = stockData.reduce((sum, item) => sum + (item.stock_final * (item.valeur_unitaire || 0)), 0);
    
    return { total, rupture, faible, totalValue };
  }, [stockData]);

  useEffect(() => {
    loadStockData();
  }, []);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="text-gray-600">Suivi des stocks, mouvements et valorisation</p>
        </div>
        <button
          onClick={loadStockData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En rupture</p>
              <p className="text-2xl font-bold text-red-600">{stats.rupture}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock faible</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.faible}</p>
            </div>
            <TrendingDown className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur totale</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalValue.toFixed(2)}€</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="rupture">En rupture</option>
              <option value="faible">Stock faible</option>
              <option value="moyen">Stock moyen</option>
              <option value="bon">Stock bon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table des stocks */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Stocks des produits ({filteredAndSortedData.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-gray-600">Chargement des stocks...</p>
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">
              {stockData.length === 0 ? 'Aucun stock trouvé' : 'Aucun résultat pour les filtres appliqués'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('product_ref')}
                  >
                    <div className="flex items-center">
                      Produit
                      <SortIcon column="product_ref" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stock_initial')}
                  >
                    <div className="flex items-center justify-center">
                      Stock Initial
                      <SortIcon column="stock_initial" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_movements')}
                  >
                    <div className="flex items-center justify-center">
                      Mouvements
                      <SortIcon column="total_movements" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stock_final')}
                  >
                    <div className="flex items-center justify-center">
                      Stock Final
                      <SortIcon column="stock_final" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Valeur</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedData.map((item) => {
                  const statusConfig = getStockStatus(item.stock_final);
                  const movementTrend = item.total_movements > 0 ? 'positive' : item.total_movements < 0 ? 'negative' : 'neutral';
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{item.product_ref}</div>
                          <div className="text-sm text-gray-600">{item.product_label}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-900">{item.stock_initial}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {movementTrend === 'positive' && <TrendingUp className="text-green-500 mr-1" size={14} />}
                          {movementTrend === 'negative' && <TrendingDown className="text-red-500 mr-1" size={14} />}
                          <span className={`font-medium ${
                            movementTrend === 'positive' ? 'text-green-600' : 
                            movementTrend === 'negative' ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {item.total_movements > 0 ? '+' : ''}{item.total_movements}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg text-gray-900">{item.stock_final}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <span className="mr-1">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-900">
                          {(item.stock_final * (item.valeur_unitaire || 0)).toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewProductDetails(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Voir les mouvements"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails des mouvements */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mouvements de stock - {selectedProduct.product_ref}
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Résumé du produit */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produit</label>
                    <p className="font-medium text-gray-900">{selectedProduct.product_ref}</p>
                    <p className="text-sm text-gray-600">{selectedProduct.product_label}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Initial</label>
                    <p className="text-lg font-bold text-blue-600">{selectedProduct.stock_initial}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mouvements</label>
                    <p className={`text-lg font-bold ${
                      selectedProduct.total_movements > 0 ? 'text-green-600' : 
                      selectedProduct.total_movements < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {selectedProduct.total_movements > 0 ? '+' : ''}{selectedProduct.total_movements}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Final</label>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.stock_final}</p>
                  </div>
                </div>
              </div>

              {/* Liste des mouvements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Historique des mouvements</h4>
                {selectedProduct.movements && selectedProduct.movements.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">Quantité</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Libellé</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProduct.movements.map((movement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              {new Date(movement.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-medium ${
                                movement.qty > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {movement.qty > 0 ? '+' : ''}{movement.qty}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                movement.type === 'entry' ? 'bg-green-100 text-green-800' :
                                movement.type === 'exit' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {movement.type === 'entry' ? 'Entrée' :
                                 movement.type === 'exit' ? 'Sortie' : 'Mouvement'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-700">
                              {movement.label || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucun mouvement de stock enregistré
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fermer
                </button>
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

export default StockManagementPage;