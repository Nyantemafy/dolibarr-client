import React from 'react';
import { Hash } from 'lucide-react';

const QuantityInput = ({ 
  value, 
  onChange, 
  label = "Quantité à produire *",
  description = "Quantité du produit fini à fabriquer",
  min = 0.01,
  step = 0.01
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="1.00"
        />
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {description}
      </p>
    </div>
  );
};

export default QuantityInput;