import React from 'react';

const GenericStats = ({ 
  data, 
  config, 
  className = "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
  itemClassName = "bg-white rounded-lg border p-4 shadow-sm",
  countFilter = (item, key) => item.status === parseInt(key)
}) => {
  return (
    <div className={className}>
      {Object.entries(config).map(([key, itemConfig]) => {
        const count = data.filter(item => countFilter(item, key)).length;
        return (
          <div key={key} className={itemClassName}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{itemConfig.label}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              {itemConfig.icon && (
                <div className="text-2xl" style={{ color: itemConfig.color }}>
                  {itemConfig.icon}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GenericStats;