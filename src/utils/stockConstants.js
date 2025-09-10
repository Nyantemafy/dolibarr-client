export const STOCK_STATUS = {
  RUPTURE: { label: 'Rupture', color: 'bg-red-100 text-red-800', icon: '🚨', max: 0 },
  FAIBLE: { label: 'Faible', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️', max: 5 },
  MOYEN: { label: 'Moyen', color: 'bg-blue-100 text-blue-800', icon: '📦', max: 20 },
  BON: { label: 'Bon', color: 'bg-green-100 text-green-800', icon: '✅', max: Infinity }
};

export const MOVEMENT_TYPES = {
  ENTRY: { label: 'Entrée', color: 'bg-green-100 text-green-800' },
  EXIT: { label: 'Sortie', color: 'bg-red-100 text-red-800' },
  OTHER: { label: 'Mouvement', color: 'bg-blue-100 text-blue-800' }
};

export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
};