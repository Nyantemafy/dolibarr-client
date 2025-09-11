import React, { useEffect, useState } from "react";
import { WarehousesService } from "../../../services/warehousesService";
import { StockService } from "../../../services/stockService";
import TextInput from "../../ui/CreatOF/TextInput";
import SubmitButton from "../../ui/CreatOF/SubmitButton";
import Notification from "../../indicateur/Notification";

const StockTransferPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");

  const [transferred, setTransferred] = useState(0);
  const [skipped, setSkipped] = useState([]);
  const [errors, setErrors] = useState([]);

  const fetchWarehouses = async () => {
    const whList = await WarehousesService.getALLWarehouses();
    setWarehouses(whList || []);
  };

  const fetchProducts = async (warehouseId) => {
    if (!warehouseId) {
      setProducts([]);
      return;
    }
    const productList = await StockService.getProductsByWarehouse(warehouseId);
    setProducts(productList || []);
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchProducts(sourceWarehouse);
  }, [sourceWarehouse]);

  const handleTransfer = async () => {
    if (!sourceWarehouse || !destinationWarehouse || !transferQuantity) {
      setNotification({ message: "Tous les champs transfert sont obligatoires", type: "error" });
      return;
    }
    if (sourceWarehouse === destinationWarehouse) {
      setNotification({ message: "Entrepôts source et destination doivent être différents", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const result = await StockService.bulkTransfer({
        sourceWarehouseId: sourceWarehouse,
        destinationWarehouseId: destinationWarehouse,
        quantity: parseFloat(transferQuantity),
      });

      setTransferred(result.transferred || 0);
      setSkipped(result.skipped || []);
      setErrors(result.errors || []);

      console.log('result', result);

      setNotification({ message: result.message || `${result.transferred} produits transférés`, type: "success" });
      fetchProducts(sourceWarehouse); // Mettre à jour les produits restants
    } catch (err) {
      setNotification({ message: "Erreur transfert", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-4 text-lg">Transfert de stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Entrepôt source</label>
            <select
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Sélectionner</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.label || w.ref}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Entrepôt destination</label>
            <select
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Sélectionner</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.label || w.ref}</option>
              ))}
            </select>
          </div>
          <TextInput label="Quantité à transférer" value={transferQuantity} onChange={setTransferQuantity} type="number" />
        </div>
        <SubmitButton loading={loading} onClick={handleTransfer} />
      </div>

      {/* Produits dans le filtre */}
      {products.length > 0 && (
        <div className="border p-4 rounded mt-4">
          <h3 className="font-semibold mb-2">Produits dans l'entrepôt source</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {products.map((p) => (
              <li key={p.id}>{p.ref} — {p.label} — Stock: {p.qty}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Résultats du transfert */}
      <div className="border p-4 rounded mt-4">
        <h3 className="font-semibold mb-2">Résultats du transfert</h3>
        
        {transferred.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-green-600">✅ Produits transférés</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {transferred.map((p, idx) => (
                <li key={idx}>{p.ref} — {p.label}</li>
              ))}
            </ul>
          </div>
        )}

        {skipped.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-yellow-600">⏭️ Produits ignorés</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {skipped.map((s, idx) => (
                <li key={idx}>
                  Produit {s.ref} — {s.label} — Raison : {s.reason}
                </li>
              ))}

            </ul>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-red-600">❌ Erreurs</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>{err.message || JSON.stringify(err)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockTransferPage;
