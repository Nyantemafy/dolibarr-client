import React from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const ValidationSummary = ({ summary }) => {
  const { hasErrors, hasWarnings, totalProducts, validProducts, totalBoms, validBoms } = summary;

  const getStatusMessage = () => {
    if (hasErrors) {
      return {
        icon: <XCircle className="w-5 h-5 mr-2" />,
        message: "Des erreurs ont été détectées. Veuillez les corriger avant d'importer.",
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-700'
      };
    }
    if (hasWarnings) {
      return {
        icon: <AlertTriangle className="w-5 h-5 mr-2" />,
        message: "Validation réussie avec quelques avertissements.",
        bg: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-700'
      };
    }
    return {
      icon: <CheckCircle className="w-5 h-5 mr-2" />,
      message: "Toutes les données sont valides et prêtes pour l'import !",
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-700'
    };
  };

  const status = getStatusMessage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Résumé de la validation</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
          <div className="text-sm text-gray-600">Produits total</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validProducts}</div>
          <div className="text-sm text-gray-600">Produits valides</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalBoms}</div>
          <div className="text-sm text-gray-600">BOMs total</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validBoms}</div>
          <div className="text-sm text-gray-600">BOMs valides</div>
        </div>
      </div>

      <div className={`p-4 ${status.bg} border ${status.border} rounded-md`}>
        <p className={`font-medium flex items-center ${status.text}`}>
          {status.icon}
          {status.message}
        </p>
      </div>
    </div>
  );
};

export default ValidationSummary;