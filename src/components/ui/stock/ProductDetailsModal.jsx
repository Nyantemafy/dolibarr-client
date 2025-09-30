import React from 'react';

const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mouvements de stock - {product.product_ref}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <ProductSummary product={product} />
          <MovementList movements={product.movements} />
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSummary = ({ product }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Produit</label>
        <p className="font-medium text-gray-900">{product.product_ref}</p>
        <p className="text-sm text-gray-600">{product.product_label}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock Initial</label>
        <p className="text-lg font-bold text-blue-600">{product.stock_initial}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mouvements</label>
        <p className={`text-lg font-bold ${
          product.total_movements > 0 ? 'text-green-600' : 
          product.total_movements < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {/* {product.total_movements > 0 ? '+' : ''}{product.total_movements} */}
          {product.total_movements}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock Final</label>
        <p className="text-lg font-bold text-gray-900">{product.stock_final}</p>
      </div>
    </div>
  </div>
);

const MovementList = ({ movements }) => (
  <div>
    <h4 className="font-medium text-gray-900 mb-3">Historique des mouvements</h4>
    {movements && movements.length > 0 ? (
      <div className="max-h-60 overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">Quantité</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Libellé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {movements.map((movement, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  {new Date(movement.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`font-medium ${
                    movement.qty > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.qty > 0 ? '+' : ''}{movement.qty}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    movement.type === 'entry' ? 'bg-green-100 text-green-800' :
                    movement.type === 'exit' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {movement.type === 'entry' ? 'Entrée' :
                     movement.type === 'exit' ? 'Sortie' : 'Mouvement'}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {movement.label || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-4 text-gray-500">
        Aucun mouvement de stock enregistré
      </div>
    )}
  </div>
);

export default ProductDetailsModal;