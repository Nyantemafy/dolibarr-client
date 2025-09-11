import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BatchNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: AlertCircle
    }
  };

  const style = styles[notification.type] || styles.info;
  const Icon = style.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${style.bg} ${style.border} ${style.text}`}>
      <div className="flex items-center">
        <Icon className="mr-2" size={20} />
        <span>{notification.message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BatchNotification;