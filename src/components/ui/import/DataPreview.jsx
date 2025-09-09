import React from 'react';

const DataPreview = ({ data, title, columns, dataMapper }) => {
  if (data.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-3">
        {title} ({data.length} entrées)
      </h4>
      
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Ligne</th>
              {columns.map((column, index) => (
                <th key={index} className="text-left p-2">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 font-mono text-xs">{item._originalIndex + 1}</td>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-2">
                    {dataMapper(item, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length > 5 && (
          <p className="text-xs text-gray-500 mt-2">
            ... et {data.length - 5} autres entrées
          </p>
        )}
      </div>
    </div>
  );
};

export default DataPreview;