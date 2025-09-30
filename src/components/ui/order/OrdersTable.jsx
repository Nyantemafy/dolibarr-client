import React, { memo } from 'react';
import { RefreshCw, Check, Play, Eye, Calendar, Factory } from 'lucide-react';
import { statusLabels } from '../../../utils/orderConstants';
import { formatDate } from '../../../utils/dateHelpers';

const OrdersTable = memo(({
  orders,
  allOrders,
  selectAll,
  loading,
  actionLoading,
  onSelectOrder,
  onSelectAll,
  onValidate,
  onProduce,
  onViewDetails,
  isOrderSelected,
  setActiveTab,
  setSelectedOrderId
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-gray-600">Chargement des ordres...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-8 text-center">
          <Factory className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">
            {allOrders.length === 0 ? 'Aucun ordre de fabrication trouvé' : 'Aucun résultat ne correspond aux filtres'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Liste des ordres</h2>
          {orders.length !== allOrders.length && (
            <p className="text-sm text-gray-600">
              {orders.length} résultat(s) sur {allOrders.length}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Référence</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Produit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nomenclature</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Quantité</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">État</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date création</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const statusConfig = statusLabels[order.status];
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isOrderSelected(order.id)}
                      onChange={() => onSelectOrder(order.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td 
                    className="px-4 py-3 cursor-pointer text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setActiveTab('order-detail');
                    }}
                  >
                    <div className="font-medium">{order.ref}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-gray-900">
                      <div className="font-medium">{order.product?.ref}</div>
                      <div className="text-sm text-gray-600">{order.product?.label}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">
                      <div className="font-medium">{order.bom?.ref}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium">{order.qty}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1" size={14} />
                        {formatDate(order.date_creation * 1000)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Bouton Voir */}
                      <button
                        onClick={() => onViewDetails(order)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Bouton Valider (si brouillon) */}
                      {order.status === 0 && (
                        <button
                          onClick={() => onValidate(order.id)}
                          disabled={actionLoading[`validate_${order.id}`]}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                          title="Valider l'ordre"
                        >
                          {actionLoading[`validate_${order.id}`] ? (
                            <RefreshCw className="animate-spin" size={12} />
                          ) : (
                            <>
                              <Check size={12} className="mr-1" />
                              Valider
                            </>
                          )}
                        </button>
                      )}

                      {/* Bouton Produire (si validé) */}
                      {order.status === 1 && (
                        <button
                          onClick={() => onProduce(order.id)}
                          disabled={actionLoading[`produce_${order.id}`]}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:bg-gray-400 flex items-center"
                          title="Produire (consommer et produire tout)"
                        >
                          {actionLoading[`produce_${order.id}`] ? (
                            <RefreshCw className="animate-spin" size={12} />
                          ) : (
                            <>
                              <Play size={12} className="mr-1" />
                              Produire
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  return prevProps.orders === nextProps.orders &&
         prevProps.selectedOrders === nextProps.selectedOrders &&
         prevProps.selectAll === nextProps.selectAll &&
         prevProps.loading === nextProps.loading &&
         prevProps.actionLoading === nextProps.actionLoading;
});

export default OrdersTable;