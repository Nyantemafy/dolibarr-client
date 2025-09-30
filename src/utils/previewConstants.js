export const VALIDATION_STATUS = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success'
};

export const STATUS_ICONS = {
  [VALIDATION_STATUS.ERROR]: 'XCircle',
  [VALIDATION_STATUS.WARNING]: 'AlertTriangle', 
  [VALIDATION_STATUS.SUCCESS]: 'CheckCircle'
};

export const STATUS_COLORS = {
  [VALIDATION_STATUS.ERROR]: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-500'
  },
  [VALIDATION_STATUS.WARNING]: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-500'
  },
  [VALIDATION_STATUS.SUCCESS]: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-500'
  }
};