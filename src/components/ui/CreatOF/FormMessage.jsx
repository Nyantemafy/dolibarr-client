import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const FormMessage = ({ type, message, icon: Icon }) => {
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-500'
    }
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-center ${style.bg} ${style.border}`}>
      {Icon && <Icon className={`mr-3 flex-shrink-0 ${style.icon}`} size={20} />}
      <span className={style.text}>{message}</span>
    </div>
  );
};

export default FormMessage;