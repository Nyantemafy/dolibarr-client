import React from 'react';
import { X, FileText } from 'lucide-react';

const ExportModal = ({
  ordersCount,
  onClose,
  onExport
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Format d'export
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Choisissez le format pour exporter {ordersCount} ordre(s) sélectionné(s)
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onExport('csv')}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
          >
            <FileText size={20} className="mr-2" />
            Export CSV
          </button>
          
          <button
            onClick={() => onExport('pdf')}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <FileText size={20} className="mr-2" />
            Export PDF (détail)
          </button>
          
          <button
            onClick={() => onExport('pdf-table')}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition-colors"
          >
            <FileText size={20} className="mr-2" />
            Export PDF (tableau)
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;