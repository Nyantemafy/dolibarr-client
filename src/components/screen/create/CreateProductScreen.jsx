import React, { useState, useEffect } from 'react';
import Notification from '../../indicateur/Notification';
import { AlertCircle, CheckCircle, Factory } from 'lucide-react';
import { WarehousesService } from '../../../services/warehousesService';
import { ProductService } from '../../../services/productService';

import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';

const CreateProductScreen = ({ onBack, submitProduct }) => {
  const [refProduct, setRefProduct] = useState('');
  const [label, setLabel] = useState('');
  const [productType, setProductType] = useState('0'); 
  const [tosell, setToSell] = useState(false);
  const [tobuy, setToBuy] = useState(false);
  const [warehouse, setWarehouse] = useState('');
  const [price, setPrice] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les entrepôts
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const list = await WarehousesService.getALLWarehouses();
        const options = list.map(w => ({ value: w.id, label: w.label || w.ref }));
        setWarehouses([{ value: '', label: 'Sélectionner un entrepôt' }, ...options]);
      } catch (err) {
        console.error("Erreur lors du chargement des entrepôts :", err);
      }
    };
    fetchWarehouses();
  }, []);

  const handleSubmit = async () => {
    if (!refProduct) {
      setNotification({ message: 'La référence du produit est obligatoire', type: 'error' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const productData = {
        ref: refProduct,
        label: label,
        type: parseInt(productType), // 0 ou 1
        tosell: tosell ? 1 : 0,
        tobuy: tobuy ? 1 : 0,
        fk_default_warehouse: warehouse,
        price: price ? parseFloat(price) : null
      };

      const result = await ProductService.createProduct(productData); 

      if(result){
        setSuccess(`Produit créé avec succès (ID: ${result.id})`);
        setNotification({ message: `Produit créé avec succès (ID: ${result.id})`, type: 'success' });

        // Reset formulaire
        setRefProduct('');
        setProductType('0');
        setToSell(false);
        setToBuy(false);
        setWarehouse('');
        setPrice('');
      } 

    } catch (err) {
      console.error(err);
      setError('Erreur lors de la création du produit');
      setNotification({ message: 'Erreur lors de la création du produit', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Factory className="mr-2 text-blue-600" size={20} />
          Création de produit
        </h2>

        {error && (
          <div className="mb-4 text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-green-600 flex items-center">
            <CheckCircle className="mr-2" size={16} />
            {success}
          </div>
        )}

        <div className="space-y-6">
          <TextInput
            value={refProduct}
            onChange={setRefProduct}
            label="Référence du produit"
            placeholder="Entrez la référence"
          />

          {/* Sélection type : Matière première / Produit fini */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de produit</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="productType"
                  value="0"
                  checked={productType === '0'}
                  onChange={() => setProductType('0')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Matière première</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="productType"
                  value="1"
                  checked={productType === '1'}
                  onChange={() => setProductType('1')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Produit fini</span>
              </label>
            </div>
          </div>

          {/* Vente / Achat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={tosell}
                  onChange={() => setToSell(!tosell)}
                  className="form-checkbox text-blue-600"
                />
                <span className="ml-2">Vente</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={tobuy}
                  onChange={() => setToBuy(!tobuy)}
                  className="form-checkbox text-blue-600"
                />
                <span className="ml-2">Achat</span>
              </label>
            </div>
          </div>

          {/* Sélection entrepôt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrepôt</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {warehouses.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <TextInput
            value={label}
            onChange={setLabel}
            label="Libellé de l'ordre"
            placeholder="Libellé"
            />

          <TextInput
            value={price}
            onChange={setPrice}
            label="Prix de vente (optionnel)"
            placeholder="Entrez le prix de vente"
            type="number"
            step="0.01"
            min="0"
          />

          <div className="pt-4 border-t">
            <SubmitButton
              loading={loading}
              disabled={!refProduct}
              onClick={handleSubmit}
            />

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
    </div>
  );
};

export default CreateProductScreen;
