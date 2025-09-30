const StatistiqueFilters = ({ filters, setFilters, onResetFilters }) => (
  <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date du jour</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="mt-4 flex justify-end">
      <button
        onClick={onResetFilters}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Réinitialiser les filtres
      </button>
    </div>
  </div>
);

export default StatistiqueFilters;