import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, X, Check } from 'lucide-react';
import apiService from '../service/apiService';
import Notification from '../indicateur/Notification';

const ResetDataButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataCount, setDataCount] = useState(null);
  const [resetResults, setResetResults] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const checkDataToDelete = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/reset/confirm');
      setDataCount(response.data || response);
      setShowConfirm(true);
    } catch (error) {
      showNotification('Erreur lors de la vérification des données: ' + error.message, 'error');
      console.error('Erreur vérification:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeReset = async () => {
    try {
      setLoading(true);
      // Use apiService.delete instead of fetch
      const result = await apiService.delete('/api/reset/all');

      setResetResults(result);
      showNotification(result.message || 'Réinitialisation terminée avec succès', 'success');
      
    } catch (error) {
      showNotification('Erreur lors de la réinitialisation: ' + error.message, 'error');
      console.error('Erreur reset:', error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const closeResults = () => {
    setResetResults(null);
    setDataCount(null);
  };

  return (
    <>
      {/* Bouton principal */}
      <button
        onClick={checkDataToDelete}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Vérification...
          </>
        ) : (
          <>
            <Trash2 className="mr-2" size={16} />
            Réinitialiser les données
          </>
        )}
      </button>

      {/* Modal de confirmation */}
      {showConfirm && dataCount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmer la réinitialisation
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Cette action va supprimer définitivement toutes les données suivantes :
                </p>
                
                <div className="bg-red-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Produits :</span>
                    <span className="font-semibold text-red-600">{dataCount.products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nomenclatures :</span>
                    <span className="font-semibold text-red-600">{dataCount.boms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ordres de fabrication :</span>
                    <span className="font-semibold text-red-600">{dataCount.manufacturing_orders}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total :</span>
                      <span className="text-red-600">{dataCount.total}</span>
                    </div>
                  </div>
                </div>

                <p className="text-red-600 font-medium mt-4">
                  ⚠️ Cette action est irréversible !
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="inline mr-2" size={16} />
                  Annuler
                </button>
                <button
                  onClick={executeReset}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="inline mr-2 animate-spin" size={16} />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Check className="inline mr-2" size={16} />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résultats */}
      {resetResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Résultats de la réinitialisation
                </h3>
                <button
                  onClick={closeResults}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Résumé */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">Résumé</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total supprimé :</span>
                    <span className="font-bold text-green-800 ml-2">
                      {resetResults.summary?.total_deleted || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700">Erreurs :</span>
                    <span className="font-bold text-red-800 ml-2">
                      {resetResults.summary?.total_errors || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="space-y-4">
                {resetResults.summary?.details && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(resetResults.summary.details).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Erreurs détaillées */}
                {resetResults.data && (
                  <div className="space-y-3">
                    {Object.entries(resetResults.data).map(([category, data]) => {
                      if (data.errors && data.errors.length > 0) {
                        return (
                          <div key={category} className="bg-red-50 rounded-lg p-3">
                            <h5 className="font-medium text-red-800 capitalize mb-2">
                              Erreurs - {category.replace('_', ' ')}
                            </h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {data.errors.map((error, index) => (
                                <div key={index} className="text-sm text-red-700">
                                  {error.id && `ID ${error.id}: `}
                                  {error.error || error.general}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default ResetDataButton;