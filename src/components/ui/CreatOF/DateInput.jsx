import React from 'react';

const DateSelect = ({ dateValue, onChange, label = "Date de fabrication (optionnel)", description = "Choisissez la date de création de l'ordre, sinon la date actuelle sera utilisée" }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="date"
        value={dateValue || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export default DateSelect;
