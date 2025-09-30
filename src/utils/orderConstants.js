export const statusLabels = {
  0: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  1: { label: 'Validé', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  2: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
  3: { label: 'Fabriqué', color: 'bg-green-100 text-green-800', icon: '🏭' }
};

export const ORDER_FIELDS = {
  BOM: 'fk_bom',
  QUANTITY: 'qty',
  LABEL: 'label',
  DESCRIPTION: 'description'
};

export const VALIDATION_RULES = {
  QUANTITY: {
    min: 0.01,
    step: 0.01
  }
};