import React from 'react';
import { Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import GenericDetailModal from '../general/GenericDetailModal';

const ProductDetailModal = ({
  product,
  actionLoading,
  onClose,
  onEdit,
  onDelete
}) => {
  // Configuration des champs pour les produits
  const productFields = [
    {
      key: 'ref',
      label: 'Référence',
      valueClassName: 'font-medium text-blue-600'
    },
    {
      key: 'label',
      label: 'Désignation',
      valueClassName: 'font-medium'
    },
    {
      key: 'description',
      label: 'Description',
      render: (product) => (
        <p className="text-gray-700 whitespace-pre-wrap">
          {product.description || 'Aucune description'}
        </p>
      )
    },
    {
      label: 'Prix',
      render: (product) => (
        <span className="font-medium text-green-600">
          {!isNaN(parseFloat(product.price)) ? `${parseFloat(product.price).toFixed(2)} €` : 'N/A'}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (product) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.type || 'Standard'}
        </span>
      )
    },
    {
      key: 'entrepo',
      label: 'Entrepôt',
      render: (product) => (
        <span className="text-gray-700">
          {product.entrepo || 'Principal'}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Stock actuel',
      render: (product) => (
        <span className={`font-medium ${
          product.stock > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {product.stock || 0} unités
        </span>
      )
    }
  ];

  // Configuration des actions
  const productActions = [
    {
      text: 'Modifier',
      icon: <Edit size={16} />,
      variant: 'primary',
      onClick: (product) => onEdit(product),
      title: 'Modifier le produit'
    },
    {
      text: 'Supprimer',
      icon: <Trash2 size={16} />,
      variant: 'danger',
      onClick: (product) => onDelete(product.id),
      loading: (product) => actionLoading[`delete_${product.id}`],
      loadingIcon: <RefreshCw className="animate-spin mr-2" size={16} />,
      loadingText: 'Suppression...',
      title: 'Supprimer le produit'
    }
  ];

  return (
    <GenericDetailModal
      item={product}
      title="Détails du produit"
      onClose={onClose}
      fields={productFields}
      actions={productActions}
    />
  );
};

export default ProductDetailModal;