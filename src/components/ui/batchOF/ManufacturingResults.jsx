import React from 'react';
import { CheckCircle, XCircle, Package } from 'lucide-react';

const ManufacturingResults = ({ results, onClearResults, onNewManufacturing }) => {
  if (!results) return null;

  return (
    <div className="mt-6 bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckCircle className="mr-2 text-green-500" size={20} />
          Résultats de la Fabrication en Lot
        </h2>
      </div>
      
      <div className="p-4">
        <ResultsSummary results={results} />
        <ResultsDetails results={results} />
        <ResultsActions 
          onClear={onClearResults} 
          onNew={onNewManufacturing} 
        />
      </div>
    </div>
  );
};

const ResultsSummary = ({ results }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <ResultCard
      icon={CheckCircle}
      title="Succès"
      value={results.successful}
      color="green"
    />

    <ResultCard
      icon={Package}
      title="Ignorés"
      value={results.skipped?.length || 0}
      color="orange"
    />
    
    {results.failed > 0 && (
      <ResultCard
        icon={XCircle}
        title="Échecs"
        value={results.failed}
        color="red"
      />
    )}
    
    <ResultCard
      icon={Package}
      title="Total"
      value={results.total_orders}
      color="blue"
    />
  </div>
);

const ResultCard = ({ icon: Icon, title, value, color }) => {
  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' }
  };

  const colorConfig = colors[color] || colors.blue;

  return (
    <div className={`rounded-lg p-3 border ${colorConfig.bg} ${colorConfig.border}`}>
      <div className="flex items-center">
        <Icon className={`mr-2 ${colorConfig.text}`} size={20} />
        <div>
          <div className="font-medium">{title}</div>
          <div className={`text-2xl font-bold ${colorConfig.text}`}>{value}</div>
        </div>
      </div>
    </div>
  );
};

const ResultsDetails = ({ results }) => (
  <div className="space-y-3">
    <h3 className="font-medium text-gray-900">Détails des fabrications</h3>
    
    {results.results?.length > 0 && (
      <ResultsSection
        title="Fabrications réussies"
        icon={CheckCircle}
        color="green"
        items={results.results}
        renderItem={(result) => (
          <div className="flex items-center justify-between">
            <span>
              <strong>{result.bom_ref}</strong> - Quantité: {result.qty}
            </span>
            <span className="text-xs font-mono bg-green-100 px-2 py-1 rounded">
              {result.mo_ref}
            </span>
          </div>
        )}
      />
    )}

    {results.errors?.length > 0 && (
      <ResultsSection
        title="Fabrications échouées"
        icon={XCircle}
        color="red"
        items={results.errors}
        renderItem={(error) => (
          <>
            <div className="font-medium">BOM ID: {error.bom_id} - Quantité: {error.qty}</div>
            <div className="text-xs text-red-600 mt-1">{error.error}</div>
          </>
        )}
      />
    )}

    {/* 💥 Nouvelle section : Fabrications ignorées (stock insuffisant) */}
    {results.skipped?.length > 0 && (
      <ResultsSection
        title="Fabrications ignorées (Stock insuffisant)"
        icon={Package}
        color="orange"
        items={results.skipped}
        renderItem={(skip) => (
          <div>
            <div className="font-medium text-gray-800">
              BOM ID: {skip.bom_id} - Qté: {skip.qty}
            </div>
            <div className="text-xs text-gray-600 mb-2">{skip.reason}</div>
            <ul className="ml-4 list-disc text-sm text-gray-700">
              {skip.missing_products?.map((p, i) => (
                <li key={i}>
                  {p.product_label} ({p.product_ref}) – Manque: {p.missing_qty}
                </li>
              ))}
            </ul>
          </div>
        )}
      />
    )}
  </div>
);


const ResultsSection = ({ title, icon: Icon, color, items, renderItem }) => {
  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' }
  };

  const colorConfig = colors[color] || colors.green;

  return (
    <div className={`rounded-lg p-3 border ${colorConfig.bg} ${colorConfig.border}`}>
      <h4 className={`font-medium mb-2 flex items-center ${colorConfig.text}`}>
        <Icon className="mr-2" size={16} />
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm bg-white rounded p-2">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsActions = ({ onClear, onNew }) => (
  <div className="flex justify-between items-center mt-6 pt-4 border-t">
    <button
      onClick={onClear}
      className="text-gray-600 hover:text-gray-800 text-sm"
    >
      Masquer les résultats
    </button>
    
    <div className="space-x-2">
      <button
        onClick={onNew}
        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
      >
        Nouvelle fabrication
      </button>
    </div>
  </div>
);

export default ManufacturingResults;