import React from "react";
import { RefreshCw } from "lucide-react";

const StatistiqueTable = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        Aucune donnée trouvée pour cette date.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nom produit</th>
            <th className="px-4 py-2 text-left">Nb Fabriqué</th>
            <th className="px-4 py-2 text-left">Nb Utilisé</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.produit_nom}</td>
              <td className="px-4 py-2">{item.nbFabrique}</td>
              <td className="px-4 py-2">{item.nbUtilise}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatistiqueTable;
