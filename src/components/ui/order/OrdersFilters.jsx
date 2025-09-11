import React from 'react';
import { statusLabels } from '../../../utils/orderConstants';

const OrdersFilters = ({ filters, setFilters, productLabels, onResetFilters }) => (
  <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les états</option>
          {Object.entries(statusLabels).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
        <input
          type="text"
          value={filters.ref}
          onChange={(e) => setFilters({...filters, ref: e.target.value})}
          placeholder="Filtrer par référence"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Produits</label>
        <select
          value={filters.product}
          onChange={(e) => setFilters({...filters, product: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les produits</option>
          {productLabels.map((product) => (
            <option key={product.id} value={product.id}>
              {product.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité min</label>
        <input
          type="number"
          value={filters.qtyMin}
          onChange={(e) => setFilters({...filters, qtyMin: e.target.value})}
          placeholder="Quantité minimale"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité max</label>
        <input
          type="number"
          value={filters.qtyMax}
          onChange={(e) => setFilters({...filters, qtyMax: e.target.value})}
          placeholder="Quantité maximale"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomenclature</label>
        <select
          value={filters.bom}
          onChange={(e) => setFilters({ ...filters, bom: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les BOM</option>
          {filters.bomOptions?.map((bom) => (
            <option key={bom.id} value={bom.id}>
              {bom.ref}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (début)</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (fin)</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="mt-4 flex justify-end">
      <button
        onClick={onResetFilters}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Réinitialiser les filtres
      </button>
    </div>
  </div>
);

export default OrdersFilters;