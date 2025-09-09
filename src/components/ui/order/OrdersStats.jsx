import React from 'react';
import { statusLabels } from '../../../utils/orderConstants';

const OrdersStats = ({ orders }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    {Object.entries(statusLabels).map(([status, config]) => {
      const count = orders.filter(order => order.status === parseInt(status)).length;
      return (
        <div key={status} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{config.label}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
            <div className="text-2xl">{config.icon}</div>
          </div>
        </div>
      );
    })}
  </div>
);

export default OrdersStats;