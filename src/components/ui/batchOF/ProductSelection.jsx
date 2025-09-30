import React from 'react';
import { Package, Plus } from 'lucide-react';

const ProductSelection = ({ 
  boms, 
  filteredBoms, 
  selectedBom, 
  quantity, 
  bomLoading, 
  onBomChange, 
  onQuantityChange, 
  onAddToQueue 
}) => {
  const selectedBomData = boms.find(b => b.id == selectedBom);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="mr-2" size={20} />
          Ajouter des Produits à Fabriquer
        </h2>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un BOM
          </label>
          <select
            value={selectedBom}
            onChange={(e) => onBomChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={bomLoading}
          >
            <option value="">-- Sélectionner un BOM --</option>
            {filteredBoms.map(bom => (
              <option key={bom.id} value={bom.id}>
                {bom.ref} - {bom.product_ref} ({bom.product_label})
              </option>
            ))}
          </select>
        </div>

        {selectedBomData && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Détails du BOM</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Référence:</strong> {selectedBomData.ref}</p>
              <p><strong>Produit:</strong> {selectedBomData.product_ref} - {selectedBomData.product_label}</p>
              <p><strong>Composants:</strong> {selectedBomData.lines?.length || 0} éléments</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantité à produire
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={onAddToQueue}
          disabled={!selectedBom || quantity <= 0}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          Ajouter à la Queue de Fabrication
        </button>
      </div>
    </div>
  );
};

export default ProductSelection;