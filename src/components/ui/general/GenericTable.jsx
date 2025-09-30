import React, { memo } from 'react';
import { RefreshCw, Factory } from 'lucide-react';

const GenericTable = memo(({
  data,
  columns,
  loading,
  loadingMessage = "Chargement des données...",
  emptyMessage = "Aucune donnée disponible",
  noResultsMessage = "Aucun résultat ne correspond aux filtres",
  allData = [],
  selectAll = false,
  onSelectAll,
  onSelectItem,
  isItemSelected,
  // Props optionnelles pour les actions personnalisées
  actionColumn,
  // Props pour la personnalisation du style
  tableClassName = "",
  headerClassName = "bg-gray-50",
  rowClassName = "hover:bg-gray-50",
  // Props pour les états de chargement spécifiques
  actionLoading = {}
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 text-center">
          <Factory className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">
            {allData.length === 0 ? emptyMessage : noResultsMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full ${tableClassName}`}>
          <thead className={headerClassName}>
            <tr>
              {/* Colonne de sélection si nécessaire */}
              {onSelectAll && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={onSelectAll}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </th>
              )}
              
              {/* Colonnes configurées */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-sm font-medium text-gray-900 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
              
              {/* Colonne d'actions si nécessaire */}
              {actionColumn && (
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className={rowClassName}>
                {/* Checkbox de sélection */}
                {onSelectItem && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isItemSelected ? isItemSelected(item.id || index) : false}
                      onChange={() => onSelectItem(item.id || index)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                )}
                
                {/* Données des colonnes */}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${column.className || ''}`}
                    onClick={() => column.onClick && column.onClick(item)}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                
                {/* Actions personnalisées */}
                {actionColumn && (
                  <td className="px-4 py-3 text-center">
                    {actionColumn.render(item, actionLoading)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  return prevProps.data === nextProps.data &&
         prevProps.loading === nextProps.loading &&
         prevProps.selectAll === nextProps.selectAll &&
         prevProps.actionLoading === nextProps.actionLoading;
});

export default GenericTable;