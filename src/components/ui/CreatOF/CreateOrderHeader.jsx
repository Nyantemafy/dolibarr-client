import React from 'react';
import { Factory } from 'lucide-react';

const CreateOrderHeader = ({ title = "Créer un ordre de fabrication", subtitle = "Nouveau brouillon d'ordre de fabrication" }) => {
  return (
    <div className="flex items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Factory className="mr-3 text-blue-600" size={28} />
          {title}
        </h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default CreateOrderHeader;