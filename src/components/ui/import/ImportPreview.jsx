import React, { useState } from 'react';
import { X, Check, AlertTriangle, Package, FileSpreadsheet, Download } from 'lucide-react';

const ImportPreview = ({ importData, onBack, onConfirm, isLoading }) => {
  const [selectedTab, setSelectedTab] = useState('products');
  const [exportFormat, setExportFormat] = useState('csv');

  const { products = [], boms = [] } = importData || {};

  const handleExport = () => {
    const dataToExport = selectedTab === 'products' ? products : boms;
    const filename = `preview_${selectedTab}_${new Date().toISOString().split('T')[0]}`;

    if (exportFormat === 'csv') {
      exportToCSV(dataToExport, filename);
    } else if (exportFormat === 'json') {
      exportToJSON(dataToExport, filename);
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProductTypeLabel = (type) => {
    return type === 1 ? 'Service' : 'Produit';
  };

  const getBOMTypeLabel = (bomtype) => {
    return bomtype === 1 ? 'Assembly' : 'Simple';
  };

  const renderProductsTable = () => (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="text-left p-3 border-b">Référence</th>
            <th className="text-left p-3 border-b">Nom</th>
            <th className="text-left p-3 border-b">Type</th>
            <th className="text-left p-3 border-b">Entrepôt</th>
            <th className="text-left p-3 border-b">Stock initial</th>
            <th className="text-left p-3 border-b">Prix vente</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-sm">{product.ref}</td>
              <td className="p-3">{product.label}</td>
              <td className="p-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {getProductTypeLabel(product.type)}
                </span>
              </td>
              <td className="p-3">{product.entrepot}</td>
              <td className="p-3">{product.stock_initial}</td>
              <td className="p-3">{product.price} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBOMsTable = () => (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="text-left p-3 border-b">Référence</th>
            <th className="text-left p-3 border-b">Libellé</th>
            <th className="text-left p-3 border-b">Type</th>
            <th className="text-left p-3 border-b">Quantité</th>
            <th className="text-left p-3 border-b">Produit</th>
            <th className="text-left p-3 border-b">Composants</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bom, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-sm">{bom.ref}</td>
              <td className="p-3">{bom.label}</td>
              <td className="p-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {getBOMTypeLabel(bom.bomtype)}
                </span>
              </td>
              <td className="p-3">{bom.qty}</td>
              <td className="p-3">{bom.bom_produit}</td>
              <td className="p-3">
                <div className="text-xs text-gray-600">
                  {bom.lines?.length > 0 ? (
                    bom.lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="mb-1">
                        {line.fk_product} × {line.qty}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">Aucun composant</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <Package className="mr-2" size={20} />
              Produits
            </h3>
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-blue-600">à importer</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <FileSpreadsheet className="mr-2" size={20} />
              Nomenclatures
            </h3>
            <p className="text-2xl font-bold text-green-600">{boms.length}</p>
            <p className="text-sm text-green-600">à importer</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aperçu avant import</h2>
            <p className="text-gray-600">Vérifiez les données avant de confirmer l'import</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              <Download size={16} className="mr-1" />
              Exporter
            </button>
            
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Produits ({products.length})
              </button>
              <button
                onClick={() => setSelectedTab('boms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'boms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Nomenclatures ({boms.length})
              </button>
              <button
                onClick={() => setSelectedTab('summary')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Résumé
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {selectedTab === 'summary' && renderSummary()}
            
            {selectedTab === 'products' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Produits à importer</h3>
                {products.length > 0 ? renderProductsTable() : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto mb-2" size={32} />
                    <p>Aucun produit à importer</p>
                  </div>
                )}
              </>
            )}

            {selectedTab === 'boms' && (
              <>
                <h3 className="text-lg font-semibold mb-4">Nomenclatures à importer</h3>
                {boms.length > 0 ? renderBOMsTable() : (
                  <div className="text-center py-8 text-gray-500">
                    <FileSpreadsheet className="mx-auto mb-2" size={32} />
                    <p>Aucune nomenclature à importer</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="mr-2 text-yellow-500" size={16} />
                <span>Vérifiez attentivement les données avant confirmation</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onBack}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Retour
                </button>
                
                <button
                  onClick={() => onConfirm(importData)}
                  disabled={isLoading || (products.length === 0 && boms.length === 0)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2" size={16} />
                      Confirmer l'import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPreview;