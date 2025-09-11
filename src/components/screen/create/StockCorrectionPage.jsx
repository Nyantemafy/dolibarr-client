import React, { useEffect, useState } from "react";
import { WarehousesService } from "../../../services/warehousesService";
import { StockService } from "../../../services/stockService";
import TextInput from "../../ui/CreatOF/TextInput";
import SubmitButton from "../../ui/CreatOF/SubmitButton";
import Notification from "../../indicateur/Notification";

const StockCorrectionPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [correctWarehouse, setCorrectWarehouse] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [correctAction, setCorrectAction] = useState("increase");
  const [correctQuantity, setCorrectQuantity] = useState("");

  const [affectedProducts, setAffectedProducts] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const whList = await WarehousesService.getALLWarehouses();
      setWarehouses(whList || []);
    };
    fetchWarehouses();
  }, []);

  const handleCorrection = async () => {
    if (!correctWarehouse || !minQty || !maxQty || !correctQuantity) {
      setNotification({ message: "Tous les champs correction sont obligatoires", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const result = await StockService.bulkCorrect({
        warehouseId: correctWarehouse,
        minQty: parseFloat(minQty),
        maxQty: parseFloat(maxQty),
        action: correctAction,
        quantity: parseFloat(correctQuantity),
      });

      if (result.message === "Correction appliquée") {
        setNotification({ message: `${result.count} produit(s) corrigé(s)`, type: "success" });
        // ⚡ s'assurer que chaque produit contient ref et label
        const productsWithRefs = (result.products || []).map(p => ({
          id: p.id,
          ref: p.ref || "N/A",
          label: p.label || "Sans nom",
          oldQty: p.oldQty,
          newQty: p.newQty
        }));
        setAffectedProducts(productsWithRefs);
      }
    } catch (err) {
      setNotification({ message: "Erreur correction", type: "error" });
      console.error("Erreur bulkCorrect:", err);
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
        <h2 className="font-semibold mb-4 text-lg">Correction de stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Entrepôt</label>
            <select
              value={correctWarehouse}
              onChange={(e) => setCorrectWarehouse(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Sélectionner</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label || w.ref}
                </option>
              ))}
            </select>
          </div>
          <TextInput label="Stock min" value={minQty} onChange={setMinQty} type="number" />
          <TextInput label="Stock max" value={maxQty} onChange={setMaxQty} type="number" />
          <div>
            <label>Action</label>
            <select
              value={correctAction}
              onChange={(e) => setCorrectAction(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="increase">Augmenter</option>
              <option value="decrease">Diminuer</option>
            </select>
          </div>
          <TextInput label="Quantité" value={correctQuantity} onChange={setCorrectQuantity} type="number" />
        </div>
        <SubmitButton loading={loading} onClick={handleCorrection} />
      </div>

      {/* Liste des produits corrigés */}
      {affectedProducts.length > 0 && (
        <div className="border p-4 rounded mt-4">
          <h3 className="font-semibold mb-2">Produits corrigés</h3>
          <ul className="list-disc list-inside space-y-1">
            {affectedProducts.map((p) => (
              <li key={p.id}>
                {p.ref} — {p.label} — Ancien stock: {p.oldQty}, Nouveau stock: {p.newQty}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockCorrectionPage;
