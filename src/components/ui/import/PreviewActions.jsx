import React from 'react';
import { Upload } from 'lucide-react';

const PreviewActions = ({ 
  onBack, 
  onConfirm, 
  isLoading, 
  canImport = true 
}) => {
  return (
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
          onClick={onConfirm}
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
  );
};

export default PreviewActions;