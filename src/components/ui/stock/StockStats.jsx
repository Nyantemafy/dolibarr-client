import React from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

const StockStats = ({ statistics }) => {
  const { total, rupture, faible, totalValue } = statistics;

  const stats = [
    {
      label: 'Total produits',
      value: total,
      icon: Package,
      color: 'text-blue-500'
    },
    {
      label: 'En rupture',
      value: rupture,
      icon: AlertTriangle,
      color: 'text-red-500',
      valueColor: 'text-red-600'
    },
    {
      label: 'Stock faible',
      value: faible,
      icon: TrendingDown,
      color: 'text-yellow-500',
      valueColor: 'text-yellow-600'
    },
    {
      label: 'Valeur totale',
      value: `${totalValue.toFixed(2)}€`,
      icon: TrendingUp,
      color: 'text-green-500',
      valueColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.valueColor || 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
            <stat.icon className={stat.color} size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockStats;