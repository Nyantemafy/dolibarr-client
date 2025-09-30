import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const OrderPlanning = ({ 
  order, 
  editedOrder, 
  isEditing, 
  onFieldChange 
}) => {
  const dateFields = [
    {
      key: 'date_creation',
      label: 'Créé le',
      icon: Calendar,
      value: order?.date_creation,
      editedValue: editedOrder?.date_creation
    },
    {
      key: 'date_start_planned',
      label: 'Début prévu',
      icon: Clock,
      value: order?.date_start_planned,
      editedValue: editedOrder?.date_start_planned
    },
    {
      key: 'date_end_planned',
      label: 'Fin prévue',
      icon: Clock,
      value: order?.date_end_planned,
      editedValue: editedOrder?.date_end_planned
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="mr-2 text-blue-500" size={20} />
        Planning
      </h2>
      
      <div className="space-y-4">
        {dateFields.map(({ key, label, icon: Icon, value, editedValue }) => (
          <div key={key} className="flex items-center text-gray-700">
            <Icon className="mr-3 text-gray-500" size={18} />
            <div className="flex-1">
              <label className="text-sm text-gray-600">{label}</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedValue || ''}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {value ? new Date(value).toLocaleDateString('fr-FR') : '—'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPlanning;