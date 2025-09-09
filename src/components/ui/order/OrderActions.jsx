import React from 'react';
import { FileText, Edit, Save, X } from 'lucide-react';

const OrderActions = ({ 
  onExport, 
  onEdit, 
  onSave, 
  onCancel, 
  isEditing, 
  loading 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileText className="mr-2" size={16} />
          Exporter en PDF
        </button>

        {!isEditing ? (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Edit className="mr-2" size={16} />
            Modifier
          </button>
        ) : (
          <>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400"
            >
              <Save className="mr-2" size={16} />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <X className="mr-2" size={16} />
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderActions;