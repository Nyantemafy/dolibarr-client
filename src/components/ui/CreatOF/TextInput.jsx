import React from 'react';

const TextInput = ({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  description, 
  type = 'text',
  rows = 3,
  multiline = false
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default TextInput;