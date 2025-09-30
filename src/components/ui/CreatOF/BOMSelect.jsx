import React from 'react';

const BOMSelect = ({ 
  boms, 
  selectedBom, 
  onChange, 
  loading, 
  label = "BOM (Nomenclature) *",
  description = "Choisissez la nomenclature à utiliser pour la fabrication"
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {loading ? (
        <div className="p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-500">Chargement des BOMs...</span>
        </div>
      ) : (
        <select
          value={selectedBom}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionner une BOM</option>
          {boms.map((bom) => (
            <option key={bom.id} value={bom.id}>
              {bom.ref} - {bom.label} 
              {bom.product && ` (${bom.product.ref})`}
            </option>
          ))}
        </select>
      )}
      <p className="text-sm text-gray-500 mt-1">
        {description}
      </p>
    </div>
  );
};

export default BOMSelect;