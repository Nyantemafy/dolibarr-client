import React, { useState, useEffect } from 'react';
import Notification from '../../indicateur/Notification';
import { AlertCircle, CheckCircle, Factory } from 'lucide-react';
import { WarehousesService } from '../../../services/warehousesService';
import { ProductService } from '../../../services/productService';
import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';
import { BomService } from '../../../services/bomService';

const CreateBOMScreen = ({ submitBOM }) => {
  const [label, setLabel] = useState('');
  const [bomType, setBOMType] = useState('manufacturing'); // manufacturing / disassembly
  const [quantity, setQuantity] = useState('');
  const [product, setProduct] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Charger produits et entrepôts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodList = await ProductService.getAllProducts();
        setProducts([{ id: '', label: 'Sélectionner un produit' }, ...prodList]);

        const whList = await WarehousesService.getALLWarehouses();
        setWarehouses([{ id: '', label: 'Sélectionner un entrepôt' }, ...whList.map(w => ({ id: w.id, label: w.label || w.ref }))]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!label || !quantity || !product || !warehouse) {
      setNotification({ message: 'Tous les champs sont obligatoires', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const bomData = {
        label,
        type: bomType,
        quantity: parseFloat(quantity),
        productId: product,
        warehouseId: warehouse
      };

      const result = await BomService.create(bomData); // fonction API

      console.log(result);

      if (result.success) {
        setNotification({ message: `BOM créé avec succès (ID: ${result.data})`, type: 'success' });
        // reset form
        setLabel('');
        setBOMType('manufacturing');
        setQuantity('');
        setProduct('');
        setWarehouse('');
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Erreur lors de la création du BOM', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Factory className="mr-2 text-blue-600" size={20} />
          Création BOM
        </h2>

        <div className="space-y-4">
          <TextInput label="Libellé" value={label} onChange={setLabel} placeholder="Nom de l'ordre" />

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={bomType}
              onChange={(e) => setBOMType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manufacturing">Fabrication</option>
              <option value="disassembly">Désassemblage</option>
            </select>
          </div>

          <TextInput label="Quantité" value={quantity} onChange={setQuantity} type="number" />

          {/* Produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Entrepôt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrepôt</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </div>

          <SubmitButton loading={loading} onClick={handleSubmit} />

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBOMScreen;
