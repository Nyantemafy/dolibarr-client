import React, { memo, useEffect, useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import GenericTable from '../general/GenericTable';
import { WarehousesService } from '../../../services/warehousesService';

const ProductTable = memo(({
  products,
  allProducts,
  selectAll,
  loading,
  actionLoading,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  isProductSelected,
  setActiveTab,
  setSelectedProductId
}) => {
  const [warehouses, setWarehouses] = useState({});

  useEffect(() => {
    const fetchWarehouses = async () => {
      const list = await WarehousesService.getALLWarehouses();
      // Map { id: label }
      const map = {};
      list.forEach(w => {
        map[w.id] = w.label || w.ref;
      });
      setWarehouses(map);
    };
    fetchWarehouses();
  }, []);

  const columns = [
    {
      key: 'ref',
      header: 'Référence',
      align: 'left',
      onClick: (product) => {
        setSelectedProductId(product.id);
        setActiveTab('product-detail');
      },
      render: (product) => (
        <div className="font-medium text-blue-600 hover:underline cursor-pointer">
          {product.ref}
        </div>
      )
    },
    {
      key: 'label',
      header: 'Désignation',
      align: 'left',
      render: (product) => (
        <div className="text-gray-900">
          <div className="font-medium">{product.label}</div>
          {product.description && (
            <div className="text-sm text-gray-600 truncate max-w-xs">
              {product.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'price',
      header: 'Prix',
      align: 'right',
      render: (product) => (
        <span className="font-medium">
            {!isNaN(parseFloat(product.price)) ? `${parseFloat(product.price).toFixed(2)} €` : 'N/A'}
        </span>
      )
    },
    {
      key: 'finished',
      header: 'Type',
      align: 'center',
      render: (product) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${product.finished == 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
        >
          {product.finished == 1 ? 'Produit manufacturé' : 'Matière première'}
        </span>
      )
    },
    {
      key: 'fk_default_warehouse',
      header: 'Entrepôt',
      align: 'left',
      render: (product) => (
        <div className="text-sm text-gray-600">
          {warehouses[product.fk_default_warehouse] || 'Principal'}
        </div>
      )
    }
  ];

  // Configuration de la colonne d'actions pour les produits
  const actionColumn = {
    render: (product, actionLoading) => (
      <div className="flex items-center justify-center space-x-2">
        {/* Bouton Voir détails */}
        <button
          onClick={() => onViewDetails(product)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded"
          title="Voir les détails"
        >
          <Eye size={16} />
        </button>

        {/* Bouton Modifier */}
        <button
          onClick={() => onEdit(product)}
          disabled={actionLoading[`edit_${product.id}`]}
          className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
          title="Modifier le produit"
        >
          <Edit size={16} />
        </button>

        {/* Bouton Supprimer */}
        {/* <button
          onClick={() => onDelete(product.id)}
          disabled={actionLoading[`delete_${product.id}`]}
          className="text-red-600 hover:text-red-800 p-1 rounded"
          title="Supprimer le produit"
        >
          <Trash2 size={16} />
        </button> */}
      </div>
    )
  };

  return (
    <GenericTable
      data={products}
      columns={columns}
      loading={loading}
      emptyMessage="Aucun produit trouvé"
      noResultsMessage="Aucun résultat ne correspond aux filtres"
      allData={allProducts}
      selectAll={selectAll}
      onSelectAll={onSelectAll}
      onSelectItem={onSelectProduct}
      isItemSelected={isProductSelected}
      actionColumn={actionColumn}
      actionLoading={actionLoading}
    />
  );
});

export default ProductTable;