import React from 'react';
import { RefreshCw } from 'lucide-react';

const StockHeader = ({ onRefresh, loading }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
        <p className="text-gray-600">Suivi des stocks, mouvements et valorisation</p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
      >
        <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
        Actualiser
      </button>
    </div>
  );
};

export default StockHeader;