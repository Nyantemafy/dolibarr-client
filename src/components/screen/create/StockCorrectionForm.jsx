import React, { useState, useEffect } from 'react';
import { WarehousesService } from '../../../services/warehousesService';
import { ProductService } from '../../../services/productService';
import Notification from '../../indicateur/Notification';
import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';

const StockCorrectionForm = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [actionType, setActionType] = useState('add'); 
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Charger produits et entrepôts
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
    if (!selectedProduct || !selectedWarehouse || !quantity) {
      setNotification({ message: "Produit, entrepôt et quantité obligatoires", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: selectedProduct,
        warehouseId: selectedWarehouse,
        action: actionType, // add ou remove
        quantity: parseFloat(quantity),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined
      };

      const result = await ProductService.correctStock(payload);

      if(result){
        setNotification({ message: "Stock corrigé avec succès", type: "success" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: "Erreur lors de la correction du stock", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Corriger le stock</h2>

      {notification && (
        <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
        />
      )}


      <div className="space-y-4">
        {/* Produit */}
        <div>
          <label className="block mb-1">Produit</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Sélectionner un produit</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.label || p.ref}</option>)}
          </select>
        </div>

        {/* Entrepôt */}
        <div>
          <label className="block mb-1">Entrepôt</label>
          <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Sélectionner un entrepôt</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.label || w.ref}</option>)}
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="block mb-1">Action</label>
          <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="add">Ajouter</option>
            <option value="remove">Retirer</option>
          </select>
        </div>

        {/* Quantité */}
        <TextInput value={quantity} onChange={setQuantity} label="Quantité" placeholder="0" type="number" step="0.01" min="0" />

        {/* Prix achat optionnel */}
        <TextInput value={purchasePrice} onChange={setPurchasePrice} label="Prix d'achat (optionnel)" placeholder="0" type="number" step="0.01" min="0" />

        <div className="flex space-x-2 pt-4">
          <SubmitButton loading={loading} onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default StockCorrectionForm;
