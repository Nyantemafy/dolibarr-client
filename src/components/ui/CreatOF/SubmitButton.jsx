import React from 'react';
import { Save } from 'lucide-react';

const SubmitButton = ({ 
  loading, 
  disabled, 
  onClick, 
  label = "Créer l'ordre (brouillon)",
  loadingLabel = "Création en cours..."
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium transition-colors ${
        disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {loadingLabel}
        </>
      ) : (
        <>
          <Save className="mr-2" size={18} />
          {label}
        </>
      )}
    </button>
  );
};

export default SubmitButton;