import React from 'react';
import { List, Trash2, Play, RefreshCw, Factory } from 'lucide-react';

const ManufacturingQueue = ({ 
  queue, 
  queueSummary, 
  loading, 
  onRemoveItem, 
  onStartManufacturing 
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <List className="mr-2" size={20} />
            Queue de Fabrication ({queueSummary.totalItems})
          </h2>
          {queueSummary.totalItems > 0 && (
            <div className="text-sm text-gray-600">
              Total: {queueSummary.totalQuantity} unités
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {queue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Factory size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun produit dans la queue de fabrication</p>
            <p className="text-sm">Ajoutez des produits depuis le panneau de gauche</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {queue.map((item) => (
                <QueueItem 
                  key={item.id} 
                  item={item} 
                  onRemove={onRemoveItem} 
                />
              ))}
            </div>

            <div className="border-t pt-4">
              <QueueSummary summary={queueSummary} />
              <button
                onClick={onStartManufacturing}
                disabled={loading || queue.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Fabrication en cours...
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Fabriquer le Tout
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const QueueItem = ({ item, onRemove }) => (
  <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {item.bom_ref} - {item.product_ref}
        </div>
        <div className="text-sm text-gray-600">{item.product_label}</div>
        <div className="text-sm font-medium text-blue-600">
          Quantité: {item.quantity}
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-600 hover:text-red-800 p-1 rounded"
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const QueueSummary = ({ summary }) => (
  <div className="bg-gray-50 rounded-lg p-3 mb-4">
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Produits différents:</span>
        <span className="font-medium text-gray-900 ml-1">{summary.totalItems}</span>
      </div>
      <div>
        <span className="text-gray-600">Quantité totale:</span>
        <span className="font-medium text-gray-900 ml-1">{summary.totalQuantity}</span>
      </div>
    </div>
  </div>
);

export default ManufacturingQueue;