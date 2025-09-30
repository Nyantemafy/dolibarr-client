import React, { useState, useEffect } from "react";
import { useNotification } from "../../../hooks/useNotification";
import { useStatistiques } from "../../../hooks/useStatistiques";
import StatistiqueTable from "../../ui/statistique/StatistiqueTable";
import Notification from "../../indicateur/Notification";

const StatistiquePage = () => {
  const { notification, showNotification, setNotification } = useNotification();
  const { stats, loading, loadStatistiques } = useStatistiques(showNotification);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0]; 
  });

  useEffect(() => {
    if (selectedDate) {
      loadStatistiques(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Statistiques de production</h1>

      {/* Filtre Date */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Date :</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Table */}
      <StatistiqueTable stats={stats} loading={loading} />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default StatistiquePage;
