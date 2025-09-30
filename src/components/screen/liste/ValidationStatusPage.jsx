import React, { useState, useEffect } from 'react';
import { ManufacturingService } from "../../../services/manufacturingService";

const statusOptions = [
  { label: 'Brouillon', value: 0 },
  { label: 'Validé', value: 1 },
  { label: 'Produite', value: 3 },
  { label: 'Annulé', value: 9 },
];

const ValidationStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await ManufacturingService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du chargement des ordres');
    }
  };

  useEffect(() => { loadOrders(); }, []);

  useEffect(() => {
    if (statusFilter === '') {
      setFilteredOrders([]);
    } else {
      const filterStatus = parseInt(statusFilter, 10);
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  }, [statusFilter, orders]);

  const handleAction = async () => {
    if (filteredOrders.length === 0) return;
    setActionLoading(true);
    try {
      const status = parseInt(statusFilter, 10);

      if (status === 0) {
        // Brouillon → Valider
        for (const order of filteredOrders) {
          await ManufacturingService.validateOrder(order.id);
        }
        alert(`${filteredOrders.length} ordre(s) validé(s)`);
      } else if (status === 1) {
        // Validé → Annuler ou Produire
        const action = window.prompt("Tapez 'A' pour Annuler ou 'P' pour Produire");
        if (action?.toUpperCase() === 'A') {
          for (const order of filteredOrders) {
            await ManufacturingService.cancelOrder(order.id);
          }
          alert(`${filteredOrders.length} ordre(s) annulé(s)`);
        } else if (action?.toUpperCase() === 'P') {
          for (const order of filteredOrders) {
            await ManufacturingService.produceOrder(order.id);
          }
          alert(`${filteredOrders.length} ordre(s) produits`);
        }
      } else if (status === 9) {
        // Annulé → Rouvrir (Validé)
        for (const order of filteredOrders) {
          await ManufacturingService.reopenOrder(order.id);
        }
        alert(`${filteredOrders.length} ordre(s) rouvert(s)`);
      }

      await loadOrders();
    } catch (error) {
      console.error(error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getActionLabel = () => {
    const status = parseInt(statusFilter, 10);
    if (status === 0) return 'Valider';
    if (status === 1) return 'Annuler / Produire';
    if (status === 9) return 'Rouvrir';
    return '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Validation des ordres de fabrication</h1>

      <div className="mb-6">
        <label className="block font-medium mb-2">Filtrer par statut :</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="">-- Choisir un statut --</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Réf</th>
            <th className="border px-2 py-1">Produit</th>
            <th className="border px-2 py-1">Quantité</th>
            <th className="border px-2 py-1">Statut</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td className="border px-2 py-1">{order.ref}</td>
              <td className="border px-2 py-1">{order.product_label}</td>
              <td className="border px-2 py-1">{order.qty}</td>
              <td className="border px-2 py-1">
                {statusOptions.find(s => s.value === order.status)?.label}
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4">Aucun ordre</td>
            </tr>
          )}
        </tbody>
      </table>

      {getActionLabel() && filteredOrders.length > 0 && (
        <button
          onClick={handleAction}
          disabled={actionLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {getActionLabel()}
        </button>
      )}
    </div>
  );
};

export default ValidationStatusPage;
