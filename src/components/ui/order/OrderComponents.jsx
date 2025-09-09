import React from 'react';
import { Layers, Package } from 'lucide-react';

const OrderComponents = ({ 
  components, 
  orderQty, 
  editedOrder, 
  isEditing 
}) => {
  const currentQty = isEditing ? editedOrder?.qty : orderQty;
  const componentsToDisplay = components || [];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Layers className="mr-2 text-blue-500" size={20} />
          Composants nécessaires
        </h2>
        <p className="text-sm text-gray-600">Liste des matières premières et composants</p>
      </div>

      {componentsToDisplay.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Désignation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité requise
                </th>
              </tr>
            </thead>
            <tbody>
              {componentsToDisplay.map((component, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {component?.product?.ref || component?.product_ref || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {component?.product?.label || component?.product_label || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(component?.qty || 0) * (currentQty || 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Package className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">Aucun composant listé</p>
        </div>
      )}
    </div>
  );
};

export default OrderComponents;