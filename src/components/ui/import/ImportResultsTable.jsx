import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { STATUS_TYPES } from '../../../utils/importConstants';

const ImportResultsTable = ({ 
  results, 
  title, 
  columns, 
  dataMapper 
}) => {
  const successCount = results.filter(item => item.status === STATUS_TYPES.SUCCESS).length;
  const totalCount = results.length;

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS_TYPES.SUCCESS:
        return <CheckCircle className="text-green-500" size={16} />;
      case STATUS_TYPES.ERROR:
        return <AlertCircle className="text-red-500" size={16} />;
      case STATUS_TYPES.WARNING:
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200';
      case STATUS_TYPES.ERROR:
        return 'bg-red-50 border-red-200';
      case STATUS_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return '';
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3 flex items-center">
        {title}
        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {successCount} succès / {totalCount} total
        </span>
      </h4>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left p-3 border-b">Statut</th>
                {columns.map((column, index) => (
                  <th key={index} className="text-left p-3 border-b">
                    {column.label}
                  </th>
                ))}
                <th className="text-left p-3 border-b">Erreur</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={`border-b ${getStatusColor(result.status)}`}>
                  <td className="p-3">
                    <div className="flex items-center">
                      {getStatusIcon(result.status)}
                      <span className="ml-2 text-xs font-medium">
                        {result.status === STATUS_TYPES.SUCCESS ? 'OK' : 
                         result.status === STATUS_TYPES.WARNING ? 'Partiel' : 'Erreur'}
                      </span>
                    </div>
                  </td>
                  
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-3">
                      {dataMapper(result.data, column.key)}
                    </td>
                  ))}
                  
                  <td className="p-3">
                    {result.error && (
                      <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded block mb-1">
                        {result.error}
                      </span>
                    )}
                    {result.createdId && (
                      <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                        ID: {result.createdId}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportResultsTable;