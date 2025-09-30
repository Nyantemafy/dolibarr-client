import React from 'react';
import { ArrowLeft, Eye } from 'lucide-react';

const PreviewHeader = ({ onBack, title = "Aperçu de l'import" }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Eye className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-gray-600">Mode prévisualisation</span>
      </div>
    </div>
  );
};

export default PreviewHeader;