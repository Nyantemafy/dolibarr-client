import React from 'react';
import { Factory, ArrowLeft } from 'lucide-react';
import { statusLabels } from '../../../utils/orderConstants';

const OrderHeaderDetaille = ({ order, onBack, showBackButton = true }) => {
  const statusConfig = statusLabels[order?.status] || statusLabels[0];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center mb-4 md:mb-0">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <Factory className="text-blue-600" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordre {order?.ref || '—'}</h1>
          <p className="text-gray-600">{order?.label || '—'}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}>
          <span className="mr-2 text-lg">{statusConfig.icon}</span>
          {statusConfig.label}
        </span>
        
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-2" size={16} />
            Retour
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderHeaderDetaille;