import React from 'react';
import { Eye, TrendingUp, TrendingDown, ChevronUp, ChevronDown} from 'lucide-react';
import { StockService } from '../../../services/stockService';

const StockTable = ({ 
  data, 
  sortConfig, 
  onSort, 
  onViewDetails,
  loading 
}) => {

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Chargement des stocks...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">📦</div>
        <p className="text-gray-600">Aucun stock trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader 
              column="product_ref" 
              label="Produit" 
              sortConfig={sortConfig} 
              onSort={onSort} 
            />
            <TableHeader 
              column="stock_initial" 
              label="Stock Initial" 
              sortConfig={sortConfig} 
              onSort={onSort} 
              center 
            />
            <TableHeader 
              column="total_movements" 
              label="Mouvements" 
              sortConfig={sortConfig} 
              onSort={onSort} 
              center 
            />
            <TableHeader 
              column="stock_final" 
              label="Stock Final" 
              sortConfig={sortConfig} 
              onSort={onSort} 
              center 
            />
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <StockTableRow 
              key={item.id} 
              item={item} 
              onViewDetails={onViewDetails} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableHeader = ({ column, label, sortConfig, onSort, center = false }) => {
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <th 
      className={`px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 ${
        center ? 'text-center' : 'text-left'
      }`}
      onClick={() => onSort(column)}
    >
      <div className={`flex items-center ${center ? 'justify-center' : ''}`}>
        {label}
        <SortIcon column={column} />
      </div>
    </th>
  );
};

const StockTableRow = ({ item, onViewDetails }) => {
  const statusConfig = StockService.getStockStatus(item.stock_final);
  // const movementTrend = item.total_movements > 0 ? 'positive' : item.total_movements < 0 ? 'negative' : 'neutral';

  const movementTrend = item.total_movements > 0 
    ? 'positive' 
    : item.total_movements < 0 
      ? 'negative' 
      : 'yellow'; // neutre devient jaune
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900">{item.product_ref}</div>
          <div className="text-sm text-gray-600">{item.product_label}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-medium text-gray-900">{item.stock_initial}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center">
          {movementTrend === 'positive' && <TrendingUp className="text-green-500 mr-1" size={14} />}
          {movementTrend === 'negative' && <TrendingDown className="text-red-500 mr-1" size={14} />}
          <span className={`font-medium ${
            movementTrend === 'positive' ? 'text-green-600' : 
            movementTrend === 'negative' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {item.total_movements > 0 ? '+' : ''}{item.total_movements}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-bold text-lg text-gray-900">{item.stock_final}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onViewDetails(item)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded"
          title="Voir les mouvements"
        >
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
};

export default StockTable;