import { useState } from 'react';
import { Upload, Package, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import apiService from '../service/apiService';
import Notification from '../indicateur/Notification';

const FileImportScreen = () => {
  const [bomFile, setBomFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [bomData, setBomData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleFileUpload = (file, type) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      // Traitement CSV avec Papaparse
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimitersToGuess: [',', ';', '\t'],
        complete: (results) => {
          try {
            const data = results.data.map(row => {
              // Nettoyer les en-têtes (supprimer les espaces)
              const cleanedRow = {};
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim();
                cleanedRow[cleanKey] = row[key];
              });
              return cleanedRow;
            });

            if (type === 'bom') {
              setBomData(data);
              setBomFile(file);
              showNotification('Fichier BOM CSV valide');
            } else {
              setProductData(data);
              setProductFile(file);
              showNotification('Fichier Produits CSV valide');
            }
          } catch (error) {
            showNotification('Erreur lors du traitement du fichier CSV', 'error');
            console.error('Erreur traitement CSV:', error);
          }
        },
        error: (error) => {
          showNotification('Erreur lors de la lecture du fichier CSV', 'error');
          console.error('Erreur Papa Parse:', error);
        }
      });
    } else {
      showNotification('Format de fichier non supporté. Veuillez utiliser des fichiers CSV.', 'error');
    }
  };

  const processImport = async () => {
    if (!bomData.length || !productData.length) {
      showNotification('Veuillez importer les deux fichiers avant de continuer', 'error');
      return;
    }

    setImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Traitement des produits d'abord
      for (const productItem of productData) {
        try {
          // Créer le produit
          const productPayload = {
            ref: productItem.produit_ref?.toString().trim(),
            label: productItem.produit_nom?.toString().trim(),
            type: productItem.produit_type === 'Service' ? 1 : 0,
            price: parseFloat(productItem.prix_vente) || 0,
            status: 1
          };

          console.log('Création produit:', productPayload);
          
          const newProduct = await apiService.post('/products', productPayload);
          console.log('Produit créé:', newProduct);
          
          // VÉRIFIEZ que newProduct contient un ID avant de continuer
          if (newProduct && newProduct.id && productItem.stock_initial > 0) {
            const stockPayload = {
              qty: parseFloat(productItem.stock_initial) || 0,
              warehouse_id: 1, // ID entrepôt par défaut
              price: parseFloat(productItem.valeur_stock_initial) || 0
            };
            
            console.log('Correction stock:', stockPayload);
            await apiService.post(`/products/${newProduct.id}/stock/correction`, stockPayload);
          } else if (!newProduct || !newProduct.id) {
            console.error('Erreur: Produit créé sans ID', newProduct);
            throw new Error('Produit créé sans ID');
          }
          
          successCount++;
        } catch (error) {
          console.error(`Erreur produit ${productItem.produit_ref}:`, error);
          errorCount++;
        }
      }

      // Traitement des BOM
      for (const bomItem of bomData) {
        try {
          const bomPayload = {
            ref: bomItem.bom_numero?.toString().trim(),
            label: bomItem.bom_libelle?.toString().trim(),
            type: bomItem.bom_type?.toString().trim(),
            qty: parseFloat(bomItem.bom_qte) || 1,
            fk_product: bomItem.bom_produit?.toString().trim(),
            lines: bomItem.bom_composition ? [
              {
                fk_product: bomItem.bom_composition,
                qty: 1
              }
            ] : []
          };

          console.log('Création BOM:', bomPayload);
          await apiService.post('/boms', bomPayload);
          successCount++;
        } catch (error) {
          console.error(`Erreur BOM ${bomItem.bom_numero}:`, error);
          errorCount++;
        }
      }

      showNotification(
        `Import terminé: ${successCount} éléments créés avec succès, ${errorCount} erreurs`, 
        errorCount === 0 ? 'success' : 'error'
      );

    } catch (error) {
      showNotification('Erreur lors du traitement des données', 'error');
      console.error('Erreur traitement:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Import de fichiers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Import BOM */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileSpreadsheet className="mr-2 text-blue-500" />
            Feuille 1 - Nomenclatures (BOM)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Colonnes attendues: bom_numero, bom_libelle, bom_type, bom_qte, bom_produit, bom_composition<br/>
            <span className="text-xs text-blue-600">Format supporté: CSV</span>
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e.target.files[0], 'bom')}
              className="w-full"
            />
            {bomFile && (
              <p className="mt-2 text-sm text-green-600">✓ {bomFile.name} ({bomData.length} lignes)</p>
            )}
          </div>
        </div>

        {/* Import Produits */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="mr-2 text-green-500" />
            Feuille 2 - Produits et Stock
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Colonnes attendues: produit_ref, produit_nom, produit_type, entrepot, stock_initial, valeur_stock_initial, prix_vente<br/>
            <span className="text-xs text-blue-600">Format supporté: CSV</span>
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e.target.files[0], 'product')}
              className="w-full"
            />
            {productFile && (
              <p className="mt-2 text-sm text-green-600">✓ {productFile.name} ({productData.length} lignes)</p>
            )}
          </div>
        </div>
      </div>

      {/* Aperçu des données */}
      {bomData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Aperçu BOM ({bomData.length} entrées)</h4>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Numéro</th>
                  <th className="text-left p-2">Libellé</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Qté</th>
                </tr>
              </thead>
              <tbody>
                {bomData.slice(0, 3).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.bom_numero}</td>
                    <td className="p-2">{item.bom_libelle}</td>
                    <td className="p-2">{item.bom_type}</td>
                    <td className="p-2">{item.bom_qte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bomData.length > 3 && <p className="text-xs text-gray-500 mt-2">... et {bomData.length - 3} autres entrées</p>}
          </div>
        </div>
      )}

      {productData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Aperçu Produits ({productData.length} entrées)</h4>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Référence</th>
                  <th className="text-left p-2">Nom</th>
                  <th className="text-left p-2">Stock initial</th>
                  <th className="text-left p-2">Prix vente</th>
                </tr>
              </thead>
              <tbody>
                {productData.slice(0, 3).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.produit_ref}</td>
                    <td className="p-2">{item.produit_nom}</td>
                    <td className="p-2">{item.stock_initial}</td>
                    <td className="p-2">{item.prix_vente} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productData.length > 3 && <p className="text-xs text-gray-500 mt-2">... et {productData.length - 3} autres entrées</p>}
          </div>
        </div>
      )}

      {/* Bouton de traitement */}
      <button
        onClick={processImport}
        disabled={!bomData.length || !productData.length || importing}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        {importing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Traitement en cours...
          </>
        ) : (
          <>
            <Upload className="mr-2" size={16} />
            Traiter les imports
          </>
        )}
      </button>

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

export default FileImportScreen;