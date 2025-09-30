import React from 'react';
import { Search, Filter } from 'lucide-react';

const StockFilters = ({ 
  searchTerm, 
  filterStatus, 
  onSearchChange, 
  onFilterChange 
}) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="rupture">En rupture</option>
            <option value="faible">Stock faible</option>
            <option value="moyen">Stock moyen</option>
            <option value="bon">Stock bon</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StockFilters;