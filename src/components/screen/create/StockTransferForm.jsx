import React, { useEffect, useState } from 'react';
import { WarehousesService } from '../../../services/warehousesService';
import { ProductService } from '../../../services/productService';
import { StockService } from '../../../services/stockService';
import Notification from '../../indicateur/Notification';
import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';

const StockTransferForm = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const prodList = await ProductService.getAllProducts();
      setProducts(prodList || []);
      const whList = await WarehousesService.getALLWarehouses();
      setWarehouses(whList || []);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedProduct || !sourceWarehouse || !destinationWarehouse || !quantity) {
      setNotification({ message: "Tous les champs sont obligatoires", type: "error" });
      return;
    }
    if (sourceWarehouse === destinationWarehouse) {
      setNotification({ message: "L'entrepôt source et destination doivent être différents", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await StockService.transferStock({
        productId: selectedProduct,
        warehouseFromId: sourceWarehouse,
        warehouseToId: destinationWarehouse,
        quantity: parseFloat(quantity),
      });
      setNotification({ message: "Transfert réussi", type: "success" });
    } catch (err) {
      console.error(err);
      setNotification({ message: "Erreur lors du transfert", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Transfert de stock</h2>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <div className="space-y-4">
        <div>
          <label>Produit</label>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Sélectionner un produit</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.label || p.ref}</option>)}
          </select>
        </div>

        <div>
          <label>Entrepôt source</label>
          <select value={sourceWarehouse} onChange={e => setSourceWarehouse(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Sélectionner un entrepôt</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
          </select>
        </div>

        <div>
          <label>Entrepôt destination</label>
          <select value={destinationWarehouse} onChange={e => setDestinationWarehouse(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Sélectionner un entrepôt</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
          </select>
        </div>

        <TextInput value={quantity} onChange={setQuantity} label="Quantité" placeholder="0" type="number" step="0.01" min="0" />

        <div className="flex space-x-2 pt-4">
          <SubmitButton loading={loading} onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default StockTransferForm;
