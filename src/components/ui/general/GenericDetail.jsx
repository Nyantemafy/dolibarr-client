import React, { memo } from 'react';
import { X } from 'lucide-react';

const GenericDetail = ({
  data,
  title = "Détails",
  fields = [],
  renderFooter,
}) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.key || index} className={field.className || ""}>
            {field.render ? (
              field.render(data)
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="text-gray-900">{data[field.key]}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {renderFooter && renderFooter(data)}
    </div>
  );
};


export default GenericDetail;