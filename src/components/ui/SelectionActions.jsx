import React from 'react';
import { Check, Download, Trash2, RefreshCw } from 'lucide-react';

const SelectionActions = ({ 
  selectedCount, 
  onExport, 
  onDelete, 
  deleteLoading 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Check className="text-blue-600 mr-2" size={20} />
          <span className="text-blue-800 font-medium">
            {selectedCount} ordre(s) sélectionné(s)
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            title="Exporter les ordres sélectionnés"
          >
            <Download size={16} className="mr-2" />
            Exporter
          </button>
          <button
            onClick={onDelete}
            disabled={deleteLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center"
            title="Supprimer les ordres sélectionnés"
          >
            {deleteLoading ? (
              <RefreshCw className="animate-spin mr-2" size={16} />
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionActions;