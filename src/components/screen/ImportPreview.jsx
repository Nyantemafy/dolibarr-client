import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Upload, Eye } from 'lucide-react';
import apiService from '../service/apiService';
import Notification from '../indicateur/Notification';

const ImportPreview = ({ importData, onBack, onConfirm, isLoading }) => {
  const [previewData, setPreviewData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Validation automatique au chargement
  useEffect(() => {
    validateImportData();
  }, [importData]);

  const validateImportData = async () => {
    setValidating(true);
    try {
      const response = await apiService.post('/api/import/preview', importData);
      
      if (response.success) {
        setPreviewData(response.data);
        
        if (response.data.summary.hasErrors) {
          showNotification('Des erreurs ont été détectées dans vos données', 'error');
        } else if (response.data.summary.hasWarnings) {
          showNotification('Validation réussie avec quelques avertissements', 'warning');
        } else {
          showNotification('Toutes les données sont valides !', 'success');
        }
      } else {
        showNotification('Erreur lors de la validation', 'error');
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      showNotification(error.response?.data?.error || 'Erreur lors de la validation', 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewData && !previewData.summary.hasErrors) {
      onConfirm(importData);
    }
  };

  const getStatusIcon = (isValid, hasWarnings) => {
    if (!isValid) return <XCircle className="w-5 h-5 text-red-500" />;
    if (hasWarnings) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getRowClass = (isValid, hasWarnings) => {
    if (!isValid) return 'bg-red-50 border-red-200';
    if (hasWarnings) return 'bg-yellow-50 border-yellow-200';
    return '';
  };

  if (validating) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Validation en cours...</h2>
        <p className="text-gray-600">Vérification de vos données d'import</p>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de validation</h2>
          <p className="text-red-600">Impossible de valider les données</p>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const canImport = !previewData.summary.hasErrors;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Aperçu de l'import</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-600">Mode prévisualisation</span>
        </div>
      </div>

      {/* Résumé de validation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Résumé de la validation</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalProducts}</div>
            <div className="text-sm text-gray-600">Produits total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{previewData.summary.validProducts}</div>
            <div className="text-sm text-gray-600">Produits valides</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalBoms}</div>
            <div className="text-sm text-gray-600">BOMs total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{previewData.summary.validBoms}</div>
            <div className="text-sm text-gray-600">BOMs valides</div>
          </div>
        </div>

        {previewData.summary.hasErrors && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 font-medium flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Des erreurs ont été détectées. Veuillez les corriger avant d'importer.
            </p>
          </div>
        )}

        {!previewData.summary.hasErrors && previewData.summary.hasWarnings && (
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-yellow-700 font-medium flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Validation réussie avec quelques avertissements.
            </p>
          </div>
        )}

        {!previewData.summary.hasErrors && !previewData.summary.hasWarnings && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-700 font-medium flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Toutes les données sont valides et prêtes pour l'import !
            </p>
          </div>
        )}
      </div>

      {/* Validation des produits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Validation des produits ({previewData.products.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Ligne</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Référence</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Libellé</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Entrepôt</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {previewData.products.map((product, index) => (
                <tr key={index} className={getRowClass(product.isValid, product.warnings.length > 0)}>
                  <td className="px-4 py-3">
                    {getStatusIcon(product.isValid, product.warnings.length > 0)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{product.line}</td>
                  <td className="px-4 py-3 font-mono">{product.ref}</td>
                  <td className="px-4 py-3">{product.label}</td>
                  <td className="px-4 py-3">{importData.products[index]?.stock_initial || 0}</td>
                  <td className="px-4 py-3">{importData.products[index]?.entrepot || '-'}</td>
                  <td className="px-4 py-3">
                    {product.errors.map((error, i) => (
                      <div key={i} className="text-red-600 text-xs mb-1">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        {error}
                      </div>
                    ))}
                    {product.warnings.map((warning, i) => (
                      <div key={i} className="text-yellow-600 text-xs mb-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {warning}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation des BOMs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Validation des BOMs ({previewData.boms.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Ligne</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Référence</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Libellé</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Produit fini</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Composants</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Messages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {previewData.boms.map((bom, index) => (
                <tr key={index} className={getRowClass(bom.isValid, bom.warnings.length > 0)}>
                  <td className="px-4 py-3">
                    {getStatusIcon(bom.isValid, bom.warnings.length > 0)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{bom.line}</td>
                  <td className="px-4 py-3 font-mono">{bom.ref}</td>
                  <td className="px-4 py-3">{bom.label}</td>
                  <td className="px-4 py-3">{bom.finishedProduct}</td>
                  <td className="px-4 py-3 text-center">{bom.componentsCount}</td>
                  <td className="px-4 py-3">
                    {bom.errors.map((error, i) => (
                      <div key={i} className="text-red-600 text-xs mb-1">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        {error}
                      </div>
                    ))}
                    {bom.warnings.map((warning, i) => (
                      <div key={i} className="text-yellow-600 text-xs mb-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {warning}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doublons détectés */}
      {(previewData.duplicates.products.length > 0 || previewData.duplicates.boms.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Doublons détectés</h3>
          
          {previewData.duplicates.products.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-600 mb-2">Produits existants :</h4>
              <div className="flex flex-wrap gap-2">
                {previewData.duplicates.products.map((ref, i) => (
                  <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {previewData.duplicates.boms.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">BOMs existants :</h4>
              <div className="flex flex-wrap gap-2">
                {previewData.duplicates.boms.map((ref, i) => (
                  <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Retour à l'import
        </button>

        <div className="flex items-center space-x-4">
          {!canImport && (
            <p className="text-red-600 text-sm font-medium">
              Corrigez les erreurs avant de continuer
            </p>
          )}
          
          <button
            onClick={handleConfirmImport}
            disabled={!canImport || isLoading}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Import en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirmer l'import</span>
              </>
            )}
          </button>
        </div>
      </div>

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

export default ImportPreview;