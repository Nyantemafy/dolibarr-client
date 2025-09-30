import React from 'react';
import { RefreshCw, Check, Play, Calendar } from 'lucide-react';
import { statusLabels } from '../../../utils/orderConstants';
import { formatDate } from '../../../utils/dateHelpers';

const OrderDetailModal = ({
  order,
  actionLoading,
  onClose,
  onValidate,
  onProduce
}) => {
  const statusConfig = statusLabels[order.status];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Détails de l'ordre de fabrication
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Référence</label>
                <p className="text-gray-900 font-medium">{order.ref}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">État</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <span className="mr-1">{statusConfig.icon}</span>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Produit à fabriquer</label>
                <p className="text-gray-900">
                  <span className="font-medium">{order.product?.ref}</span>
                  <br />
                  <span className="text-sm text-gray-600">{order.product?.label}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité</label>
                <p className="text-gray-900 font-medium">{order.qty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de création</label>
                <p className="text-gray-900">{formatDate(order.date_creation)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date prévue</label>
                <p className="text-gray-900">{formatDate(order.date_start_planned)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nomenclature</label>
              <p className="text-gray-900">{order.bom?.ref}</p>
            </div>

            {/* Actions dans le modal */}
            <div className="flex space-x-3 pt-4 border-t">
              {order.status === 0 && (
                <button
                  onClick={() => {
                    onValidate(order.id);
                  }}
                  disabled={actionLoading[`validate_${order.id}`]}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {actionLoading[`validate_${order.id}`] ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : (
                    <Check className="mr-2" size={16} />
                  )}
                  Valider
                </button>
              )}

              {order.status === 1 && (
                <button
                  onClick={() => {
                    onProduce(order.id);
                  }}
                  disabled={actionLoading[`produce_${order.id}`]}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {actionLoading[`produce_${order.id}`] ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : (
                    <Play className="mr-2" size={16} />
                  )}
                  Produire
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;