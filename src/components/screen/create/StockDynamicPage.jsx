import React, { useEffect, useState } from 'react';
import { WarehousesService } from '../../../services/warehousesService';
import { StockService } from '../../../services/stockService';
import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';
import Notification from '../../indicateur/Notification';

const StockDynamicPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Correction stock
  const [correctWarehouse, setCorrectWarehouse] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [correctAction, setCorrectAction] = useState('increase');
  const [correctQuantity, setCorrectQuantity] = useState('');

  // Transfert stock
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');

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
      if(result.message =='Correction appliquée'){
        setNotification({ message: `${result.count} produits corrigés`, type: "success" });
      }
    } catch (err) {
      setNotification({ message: "Erreur correction", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
      setNotification({ message: `${result.count} produits transférés`, type: "success" });
    } catch (err) {
      setNotification({ message: "Erreur transfert", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Correction stock */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Correction de stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Entrepôt</label>
            <select value={correctWarehouse} onChange={e => setCorrectWarehouse(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="">Sélectionner</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
            </select>
          </div>
          <TextInput label="Stock min" value={minQty} onChange={setMinQty} type="number" />
          <TextInput label="Stock max" value={maxQty} onChange={setMaxQty} type="number" />
          <div>
            <label>Action</label>
            <select value={correctAction} onChange={e => setCorrectAction(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="increase">Augmenter</option>
              <option value="decrease">Diminuer</option>
            </select>
          </div>
          <TextInput label="Quantité" value={correctQuantity} onChange={setCorrectQuantity} type="number" />
        </div>
        <SubmitButton loading={loading} onClick={handleCorrection} />
      </div>

      {/* Transfert stock */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Transfert de stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Entrepôt source</label>
            <select value={sourceWarehouse} onChange={e => setSourceWarehouse(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="">Sélectionner</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
            </select>
          </div>
          <div>
            <label>Entrepôt destination</label>
            <select value={destinationWarehouse} onChange={e => setDestinationWarehouse(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="">Sélectionner</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
            </select>
          </div>
          <TextInput label="Quantité à transférer" value={transferQuantity} onChange={setTransferQuantity} type="number" />
        </div>
        <SubmitButton loading={loading} onClick={handleTransfer} />
      </div>
    </div>
  );
};

export default StockDynamicPage;
