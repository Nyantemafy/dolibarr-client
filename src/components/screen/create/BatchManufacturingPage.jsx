import React, { useState, useEffect } from 'react';
import apiService from '../../service/apiService';
import { Plus, Trash2, Package, Play, RefreshCw, CheckCircle, XCircle, AlertCircle, Search, Factory, List } from 'lucide-react';

const BatchManufacturingPage = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [manufacturingQueue, setManufacturingQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [manufacturingResults, setManufacturingResults] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Chargement de la liste des BOM
  const loadBoms = async () => {
    try {
      setBomLoading(true);
      const response = await apiService.get('/api/boms/liste');
      setBoms(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des BOM: ' + error.message, 'error');
      console.error('Erreur chargement BOM:', error);
    } finally {
      setBomLoading(false);
    }
  };

  // Ajouter un produit à la queue de fabrication
  const addToQueue = () => {
    if (!selectedBom || quantity <= 0) {
      showNotification('Veuillez sélectionner un BOM et une quantité valide', 'error');
      return;
    }

    const bom = boms.find(b => b.id == selectedBom);
    if (!bom) {
      showNotification('BOM non trouvé', 'error');
      return;
    }

    const newItem = {
      id: Date.now(),
      bom_id: bom.id,
      bom_ref: bom.ref,
      bom_label: bom.label,
      product_ref: bom.product_ref,
      product_label: bom.product_label,
      quantity: parseInt(quantity),
      totalValue: parseInt(quantity) * (bom.product_price || 0)
    };

    setManufacturingQueue([...manufacturingQueue, newItem]);
    setSelectedBom('');
    setQuantity(1);
    showNotification(`${bom.product_ref} ajouté à la queue de fabrication`);
  };

  // Supprimer un élément de la queue
  const removeFromQueue = (id) => {
    setManufacturingQueue(manufacturingQueue.filter(item => item.id !== id));
    showNotification('Élément retiré de la queue de fabrication');
  };

  // Lancer la fabrication en lot
  const startBatchManufacturing = async () => {
    if (manufacturingQueue.length === 0) {
      showNotification('Aucun produit dans la queue de fabrication', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const orders = manufacturingQueue.map(item => ({
        bom_id: item.bom_id,
        qty: item.quantity,
        label: `Fabrication lot ${item.bom_ref} - Qté: ${item.quantity}`
      }));

      const response = await apiService.post('/api/manufacturing/orders/batch', { orders });
      
      if (response.success) {
        setManufacturingResults(response.data);
        setManufacturingQueue([]);
        showNotification(
          `Fabrication terminée: ${response.data.successful} succès, ${response.data.failed} échecs`,
          response.data.failed === 0 ? 'success' : 'warning'
        );
      } else {
        throw new Error(response.error || 'Erreur lors de la fabrication');
      }

    } catch (error) {
      showNotification('Erreur lors de la fabrication: ' + error.message, 'error');
      console.error('Erreur fabrication:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des BOM
  const filteredBoms = boms.filter(bom =>
    bom.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.product_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.product_label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculs de résumé
  const queueSummary = {
    totalItems: manufacturingQueue.length,
    totalQuantity: manufacturingQueue.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: manufacturingQueue.reduce((sum, item) => sum + item.totalValue, 0)
  };

  useEffect(() => {
    loadBoms();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fabrication en Lot</h1>
          <p className="text-gray-600">Planifiez et lancez la fabrication de plusieurs produits simultanément</p>
        </div>
        <button
          onClick={loadBoms}
          disabled={bomLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          <RefreshCw className={`mr-2 ${bomLoading ? 'animate-spin' : ''}`} size={16} />
          Actualiser BOM
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Ajout de produits */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="mr-2" size={20} />
              Ajouter des Produits à Fabriquer
            </h2>
          </div>
          
          <div className="p-4">

            {/* Sélection BOM */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un BOM
              </label>
              <select
                value={selectedBom}
                onChange={(e) => setSelectedBom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={bomLoading}
              >
                <option value="">-- Sélectionner un BOM --</option>
                {filteredBoms.map(bom => (
                  <option key={bom.id} value={bom.id}>
                    {bom.ref} - {bom.product_ref} ({bom.product_label})
                  </option>
                ))}
              </select>
            </div>

            {/* Détails du BOM sélectionné */}
            {selectedBom && (() => {
              const bom = boms.find(b => b.id == selectedBom);
              return bom && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Détails du BOM</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>Référence:</strong> {bom.ref}</p>
                    <p><strong>Produit:</strong> {bom.product_ref} - {bom.product_label}</p>
                    <p><strong>Composants:</strong> {bom.lines?.length || 0} éléments</p>
                  </div>
                </div>
              );
            })()}

            {/* Quantité */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité à produire
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton Ajouter */}
            <button
              onClick={addToQueue}
              disabled={!selectedBom || quantity <= 0}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              <Plus size={16} className="mr-2" />
              Ajouter à la Queue de Fabrication
            </button>
          </div>
        </div>

        {/* Section Queue de fabrication */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <List className="mr-2" size={20} />
                Queue de Fabrication ({queueSummary.totalItems})
              </h2>
              {queueSummary.totalItems > 0 && (
                <div className="text-sm text-gray-600">
                  Total: {queueSummary.totalQuantity} unités
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {manufacturingQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Factory size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucun produit dans la queue de fabrication</p>
                <p className="text-sm">Ajoutez des produits depuis le panneau de gauche</p>
              </div>
            ) : (
              <>
                {/* Liste des produits en queue */}
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {manufacturingQueue.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.bom_ref} - {item.product_ref}
                          </div>
                          <div className="text-sm text-gray-600">{item.product_label}</div>
                          <div className="text-sm font-medium text-blue-600">
                            Quantité: {item.quantity}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Résumé et bouton de fabrication */}
                <div className="border-t pt-4">
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Produits différents:</span>
                        <span className="font-medium text-gray-900 ml-1">{queueSummary.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantité totale:</span>
                        <span className="font-medium text-gray-900 ml-1">{queueSummary.totalQuantity}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startBatchManufacturing}
                    disabled={loading || manufacturingQueue.length === 0}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center font-medium"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={20} />
                        Fabrication en cours...
                      </>
                    ) : (
                      <>
                        <Play size={20} className="mr-2" />
                        Fabriquer le Tout
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Résultats de fabrication */}
      {manufacturingResults && (
        <div className="mt-6 bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="mr-2 text-green-500" size={20} />
              Résultats de la Fabrication en Lot
            </h2>
          </div>
          
          <div className="p-4">
            {/* Résumé des résultats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  <div>
                    <div className="font-medium text-green-900">Succès</div>
                    <div className="text-2xl font-bold text-green-600">{manufacturingResults.successful}</div>
                  </div>
                </div>
              </div>
              
              {manufacturingResults.failed > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center">
                    <XCircle className="text-red-500 mr-2" size={20} />
                    <div>
                      <div className="font-medium text-red-900">Échecs</div>
                      <div className="text-2xl font-bold text-red-600">{manufacturingResults.failed}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center">
                  <Package className="text-blue-500 mr-2" size={20} />
                  <div>
                    <div className="font-medium text-blue-900">Total</div>
                    <div className="text-2xl font-bold text-blue-600">{manufacturingResults.total_orders}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails des résultats */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Détails des fabrications</h3>
              
              {manufacturingResults.results && manufacturingResults.results.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <CheckCircle className="mr-2" size={16} />
                    Fabrications réussies
                  </h4>
                  <div className="space-y-2">
                    {manufacturingResults.results.map((result, index) => (
                      <div key={index} className="text-sm text-green-800 bg-white rounded p-2">
                        <div className="flex items-center justify-between">
                          <span>
                            <strong>{result.bom_ref}</strong> - Quantité: {result.qty}
                          </span>
                          <span className="text-xs font-mono bg-green-100 px-2 py-1 rounded">
                            {result.mo_ref}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {manufacturingResults.errors && manufacturingResults.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center">
                    <XCircle className="mr-2" size={16} />
                    Fabrications échouées
                  </h4>
                  <div className="space-y-2">
                    {manufacturingResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-800 bg-white rounded p-2">
                        <div className="font-medium">BOM ID: {error.bom_id} - Quantité: {error.qty}</div>
                        <div className="text-xs text-red-600 mt-1">{error.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions sur les résultats */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                onClick={() => setManufacturingResults(null)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Masquer les résultats
              </button>
              
              <div className="space-x-2">
                <button
                  onClick={loadBoms}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                >
                  Nouvelle fabrication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="mr-2" size={20} />}
            {notification.type === 'error' && <XCircle className="mr-2" size={20} />}
            {notification.type === 'warning' && <AlertCircle className="mr-2" size={20} />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManufacturingPage;