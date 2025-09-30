import React, { useState, useEffect } from 'react';

const GenericFilters = ({ 
  filters, 
  setFilters, 
  onResetFilters,
  filterConfig = [],
  title = "Filtres",
  className = "bg-white rounded-lg border shadow-sm p-4 mb-4"
}) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onResetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${filterConfig.length > 3 ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {filterConfig.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            
            {filter.type === 'select' ? (
              <select
                value={filters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'number' ? (
              <input
                type="number"
                min={filter.min || 0}
                step={filter.step || 1}
                value={filters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={filters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenericFilters;