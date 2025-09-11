import React from 'react';
import { useImportPreview } from '../../hooks/useImportPreview';
import Notification from '../indicateur/Notification';

import PreviewHeader from '../ui/import/PreviewHeader';
import ValidationSummary from '../ui/import/ValidationSummary';
import ValidationTable from '../ui/import/ValidationTable';
import DuplicatesSection from '../ui/import/DuplicatesSection';
import PreviewActions from '../ui/import/PreviewActions';

const ImportPreview = ({ importData, onBack, onConfirm, isLoading }) => {
  const { previewData, validating, validationResult } = useImportPreview(importData);
  const [notification, setNotification] = React.useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleConfirmImport = () => {
    if (validationResult?.isValid) {
      onConfirm(importData);
    }
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
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de validation</h2>
          <p className="text-red-600">Impossible de valider les données</p>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center mx-auto"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const canImport = validationResult?.isValid;

  return (
    <div className="p-6 space-y-6">
      <PreviewHeader onBack={onBack} />
      
      <ValidationSummary summary={previewData.summary} />
      
      <ValidationTable
        data={previewData.products}
        title="Validation des produits"
        columns={['Référence', 'Libellé', 'Stock', 'Entrepôt']}
        type="products"
        importData={importData}
      />
      
      <ValidationTable
        data={previewData.boms}
        title="Validation des BOMs"
        columns={['Référence', 'Libellé', 'Produit fini', 'Composants']}
        type="boms"
        importData={importData}
      />
      
      <DuplicatesSection duplicates={previewData.duplicates} />
      
      <PreviewActions
        onBack={onBack}
        onConfirm={handleConfirmImport}
        isLoading={isLoading}
        canImport={canImport}
      />

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