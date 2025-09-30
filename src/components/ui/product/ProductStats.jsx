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