import React from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { ValidationService } from '../../../services/validationService';
import { VALIDATION_STATUS } from '../../../utils/previewConstants';

const ValidationTable = ({ 
  data, 
  title, 
  columns, 
  type = 'products',
  importData 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case VALIDATION_STATUS.ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case VALIDATION_STATUS.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case VALIDATION_STATUS.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getAdditionalData = (item, index) => {
    if (type === 'products') {
      return {
        stock: importData?.products[index]?.stock_initial || 0,
        warehouse: importData?.products[index]?.entrepot || '-'
      };
    }
    return {
      finishedProduct: item.finishedProduct,
      componentsCount: item.componentsCount
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title} ({data.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Ligne</th>
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-3 text-left font-medium text-gray-700">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-700">Messages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => {
              const status = ValidationService.getValidationStatus(item);
              const additionalData = getAdditionalData(item, index);
              
              return (
                <tr key={index} className={ValidationService.getRowClass(status)}>
                  <td className="px-4 py-3">
                    {getStatusIcon(status)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{item.line}</td>
                  <td className="px-4 py-3 font-mono">{item.ref}</td>
                  <td className="px-4 py-3">{item.label}</td>
                  
                  {type === 'products' ? (
                    <>
                      <td className="px-4 py-3">{additionalData.stock}</td>
                      <td className="px-4 py-3">{additionalData.warehouse}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{additionalData.finishedProduct}</td>
                      <td className="px-4 py-3 text-center">{additionalData.componentsCount}</td>
                    </>
                  )}
                  
                  <td className="px-4 py-3">
                    {item.errors?.map((error, i) => (
                      <div key={i} className="text-red-600 text-xs mb-1">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        {error}
                      </div>
                    ))}
                    {item.warnings?.map((warning, i) => (
                      <div key={i} className="text-yellow-600 text-xs mb-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {warning}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidationTable;