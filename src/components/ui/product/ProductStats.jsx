import GenericStats from '../general/GenericStats';

const ProductStats = ({ products }) => {
  const productCategoryConfig = {
    standard: {
        label: 'Produits Standard',
        icon: '📦',
        color: '#3B82F6'
    },
    personnalise: {
        label: 'Produits Personnalisés',
        icon: '🎨',
        color: '#8B5CF6'
    },
    digital: {
        label: 'Produits Digitaux',
        icon: '💾',
        color: '#10B981'
    },
    physique: {
        label: 'Produits Physiques',
        icon: '📱',
        color: '#F59E0B'
    },
    service: {
        label: 'Services',
        icon: '🔧',
        color: '#EF4444'
    }
    };

  return (
    <GenericStats
      data={products}
      config={productCategoryConfig}
      countFilter={(product, category) => product.category === category}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      itemClassName="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
    />
  );
};

export default ProductStats;

// import React from 'react';

// const ProductStatsManual = ({ products }) => {
//   const countStandard = products.filter(p => p.category === 'standard').length;
//   const countPersonnalise = products.filter(p => p.category === 'personnalise').length;
//   const countDigital = products.filter(p => p.category === 'digital').length;
//   const countPhysique = products.filter(p => p.category === 'physique').length;
//   const countService = products.filter(p => p.category === 'service').length;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       {/* Standard */}
//       <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Produits Standard</p>
//             <p className="text-2xl font-bold text-gray-900">{countStandard}</p>
//           </div>
//           <div className="text-2xl" style={{ color: '#3B82F6' }}>📦</div>
//         </div>
//       </div>

//       {/* Personnalisés */}
//       <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Produits Personnalisés</p>
//             <p className="text-2xl font-bold text-gray-900">{countPersonnalise}</p>
//           </div>
//           <div className="text-2xl" style={{ color: '#8B5CF6' }}>🎨</div>
//         </div>
//       </div>

//       {/* Digitaux */}
//       <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Produits Digitaux</p>
//             <p className="text-2xl font-bold text-gray-900">{countDigital}</p>
//           </div>
//           <div className="text-2xl" style={{ color: '#10B981' }}>💾</div>
//         </div>
//       </div>

//       {/* Physiques */}
//       <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Produits Physiques</p>
//             <p className="text-2xl font-bold text-gray-900">{countPhysique}</p>
//           </div>
//           <div className="text-2xl" style={{ color: '#F59E0B' }}>📱</div>
//         </div>
//       </div>

//       {/* Services */}
//       <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-600">Services</p>
//             <p className="text-2xl font-bold text-gray-900">{countService}</p>
//           </div>
//           <div className="text-2xl" style={{ color: '#EF4444' }}>🔧</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductStatsManual;
