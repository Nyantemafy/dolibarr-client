import React from 'react';
import { FileSpreadsheet, Package, CheckCircle } from 'lucide-react';
import { IMPORT_TYPES, BOM_COLUMNS, PRODUCT_COLUMNS } from '../../../utils/importConstants';

const FileUploadCard = ({ 
  type, 
  file, 
  data, 
  onFileUpload, 
  title, 
  icon: Icon, 
  description 
}) => {
  const columns = type === IMPORT_TYPES.BOM ? BOM_COLUMNS : PRODUCT_COLUMNS;

  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Icon className="mr-2" />
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Colonnes attendues: {columns.join(', ')}
        {type === IMPORT_TYPES.BOM && (
          <span className="block text-xs text-blue-600 mt-1">
            Composition format: (produit,qté)+(produit,qté)
          </span>
        )}
      </p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => onFileUpload(e.target.files[0], type)}
          className="w-full"
        />
        
        {file && (
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <CheckCircle className="mr-1" size={16} />
            {file.name} ({data.length} lignes)
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadCard;