import React from 'react';
import { Edit } from 'lucide-react';
import GenericDetail from '../general/GenericDetail';

const ProductFields = ({ product, onClose, onEdit }) => {
  const productFields = [
    {
      key: 'ref',
      label: 'Référence',
      className: "p-4 bg-gray-50 rounded-lg"
    },
    {
      key: 'label',
      label: 'Désignation',
      className: "p-4 bg-gray-50 rounded-lg"
    },
    {
      key: 'description',
      label: 'Description',
      render: (product) => (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <p className="text-gray-900 whitespace-pre-wrap">
            {product.description || 'Aucune description'}
          </p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Prix',
      render: (product) => (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix
          </label>
          <p className="text-blue-600 font-semibold text-lg">
            {!isNaN(parseFloat(product.price)) ? `${parseFloat(product.price).toFixed(2)} €` : 'N/A'}
          </p>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (product) => (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            product.type === 'standard' ? 'bg-blue-100 text-blue-800' :
            product.type === 'personnalise' ? 'bg-purple-100 text-purple-800' :
            product.type === 'digital' ? 'bg-green-100 text-green-800' :
            product.type === 'physique' ? 'bg-orange-100 text-orange-800' :
            product.type === 'service' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {product.type || 'Standard'}
          </span>
        </div>
      )
    },
    {
      key: 'entrepo',
      label: 'Entrepôt',
      className: "p-4 bg-gray-50 rounded-lg"
    }
  ];

  // Footer personnalisé avec boutons d'action
  const renderFooter = (product) => (
    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
      <button
        onClick={() => onEdit(product)}
        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
      >
        <Edit size={16} className="mr-2" />
        Modifier
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Retour à la liste
      </button>
    </div>
  );

  return (
    <GenericDetail
      data={product}
      title="Détails du Produit"
      fields={productFields}
      renderFooter={renderFooter}
    />
  );
};

export default ProductFields;