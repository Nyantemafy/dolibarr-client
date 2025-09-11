import React from 'react';

const DuplicatesSection = ({ duplicates }) => {
  if (duplicates.products.length === 0 && duplicates.boms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-red-600">Doublons détectés</h3>
      
      {duplicates.products.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-600 mb-2">Produits existants :</h4>
          <div className="flex flex-wrap gap-2">
            {duplicates.products.map((ref, i) => (
              <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}

      {duplicates.boms.length > 0 && (
        <div>
          <h4 className="font-medium text-red-600 mb-2">BOMs existants :</h4>
          <div className="flex flex-wrap gap-2">
            {duplicates.boms.map((ref, i) => (
              <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicatesSection;