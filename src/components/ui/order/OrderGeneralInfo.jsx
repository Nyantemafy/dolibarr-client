import React from 'react';
import { FileText } from 'lucide-react';

const OrderGeneralInfo = ({ 
  order, 
  editedOrder, 
  isEditing, 
  boms, 
  onBOMChange, 
  onFieldChange 
}) => {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="mr-2 text-blue-500" size={20} />
        Informations générales
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Référence</p>
            <p className="text-gray-900 font-medium">{order?.ref || '—'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Nomenclature</p>
            {isEditing ? (
              <select
                value={editedOrder?.bom?.id || ''}
                onChange={(e) => onBOMChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Choisir une BOM —</option>
                {boms.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.ref} - {b.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 font-medium">{order?.bom?.ref || '—'}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Produit à fabriquer</p>
            <p className="text-gray-900 font-medium">
                {isEditing 
                    ? `${editedOrder?.product?.ref || '—'} - ${editedOrder?.product?.label || '—'}`
                    : `${order?.product?.ref || '—'} - ${order?.product?.label || '—'}`
                }
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantité</label>
            {isEditing ? (
              <input
                type="number"
                value={editedOrder?.qty || ''}
                onChange={(e) => onFieldChange('qty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 font-medium text-xl">{order?.qty || 0} unités</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderGeneralInfo;