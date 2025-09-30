import React from 'react';
import { RefreshCw } from 'lucide-react';

const StatistiqueHeader = ({ onRefresh, loading, title = "Statistique", subtitle = "Statistique sur Nombre de produit fabriquer et utilise" }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center transition-colors duration-200"
      >
        <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
        Actualiser
      </button>
    </div>
  );
};

export default StatistiqueHeader;