import React from 'react';
import { Upload, Eye, X } from 'lucide-react';

const ActionButtons = ({
  onPreview,
  onImport,
  onReset,
  importing,
  hasBomData,
  hasProductData,
  hasResults
}) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={onPreview}
        disabled={!hasBomData || !hasProductData || importing}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        <Eye className="mr-2" size={16} />
        Voir aperçu
      </button>

      <button
        onClick={onImport}
        disabled={!hasBomData || !hasProductData || importing}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        {importing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Import en cours...
          </>
        ) : (
          <>
            <Upload className="mr-2" size={16} />
            Import direct
          </>
        )}
      </button>

      {hasResults && (
        <button
          onClick={onReset}
          className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 flex items-center"
        >
          <X className="mr-2" size={16} />
          Réinitialiser
        </button>
      )}
    </div>
  );
};

export default ActionButtons;