import React, { useState, useEffect } from 'react';
import { Factory, Hash, Save, ArrowLeft, AlertCircle, CheckCircle, Package } from 'lucide-react';
import apiService from '../../service/apiService';
import Notification from '../../indicateur/Notification'; 

const CreateOfScreen = ({ onBack }) => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBoms, setLoadingBoms] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState(null); 

  // Charger la liste des BOMs disponibles
  useEffect(() => {
    fetchBoms();
  }, []);

  const fetchBoms = async () => {
    try {
      setLoadingBoms(true);
      setError('');
      
      const response = await apiService.get('/api/boms/liste');
      const data = response.data; 
      console.log(data)
      
      setBoms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching BOMs:', err);
      setError('Impossible de charger la liste des BOMs: ' + err.message);
      setBoms([]);
    } finally {
      setLoadingBoms(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedBom) {
      setError('Veuillez sélectionner une BOM');
      return;
    }
    
    if (!quantity || quantity <= 0) {
      setError('Veuillez saisir une quantité valide');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orderData = {
        fk_bom: selectedBom,
        qty: quantity,
        label: label || `Ordre de fabrication - BOM #${selectedBom}`,
        description: description
      };

      const response = await apiService.post('/api/manufacturing/create', orderData);

      const result = response.data;

      console.log('Result received from API:', result);

      if (result && result.id) {
        setNotification({ message: `Ordre de fabrication créé avec succès (ID: ${result.id})`, type: 'success' });
        
        setSelectedBom('');
        setQuantity(1);
        setLabel('');
        setDescription('');
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }

    } catch (err) {
      console.error('Error creating order:', err);
      setNotification({ message: 'Erreur lors de la création: ' + err.message, type: 'error' });
      setError('Erreur lors de la création: ' + err.message);
    } finally {
      setLoading(false);
    }

  };

  const handleBomChange = (e) => {
    const bomId = e.target.value;
    setSelectedBom(bomId);
    
    // Auto-générer le label si pas encore défini
    if (!label && bomId) {
      const selectedBomData = boms.find(bom => bom.id == bomId);
      if (selectedBomData) {
        setLabel(`Ordre - ${selectedBomData.label || selectedBomData.ref}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Factory className="mr-3 text-blue-600" size={28} />
            Créer un ordre de fabrication
          </h1>
          <p className="text-gray-600 mt-1">Nouveau brouillon d'ordre de fabrication</p>
        </div>
      </div>

      {/* Messages d'erreur et succès */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Formulaire principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Factory className="mr-2 text-blue-600" size={20} />
          Informations de l'ordre
        </h2>

        <div className="space-y-6">
          {/* Sélection BOM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BOM (Nomenclature) *
            </label>
            {loadingBoms ? (
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-gray-500">Chargement des BOMs...</span>
              </div>
            ) : (
              <select
                value={selectedBom}
                onChange={handleBomChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une BOM</option>
                {boms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.ref} - {bom.label} 
                    {bom.product && ` (${bom.product.ref})`}
                  </option>
                ))}
              </select>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Choisissez la nomenclature à utiliser pour la fabrication
            </p>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité à produire *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quantité du produit fini à fabriquer
            </p>
          </div>

          {/* Label personnalisé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé de l'ordre
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Libellé automatique basé sur la BOM"
            />
            <p className="text-sm text-gray-500 mt-1">
              Laissez vide pour générer automatiquement
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Informations complémentaires sur cet ordre..."
            />
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedBom || !quantity || loadingBoms}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium transition-colors ${
                loading || !selectedBom || !quantity || loadingBoms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Créer l'ordre (brouillon)
                </>
              )}
            </button>

            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOfScreen;