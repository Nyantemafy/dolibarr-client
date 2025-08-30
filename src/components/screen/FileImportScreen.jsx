import { useState } from 'react';
import { Upload, Package, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import apiService from '../service/apiService';
import Notification from '../indicateur/Notification';
import ResetDataButton from '../btn/ResetDataButton';

const FileImportScreen = () => {
  const [bomFile, setBomFile] = useState(null);
  
  const [productFile, setProductFile] = useState(null);
  const [bomData, setBomData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [importResults, setImportResults] = useState({
    products: [],
    boms: []
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleFileUpload = (file, type) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimitersToGuess: [',', ';', '\t'],
        complete: (results) => {
          try {
            const data = results.data.map((row, index) => {
              const cleanedRow = { _originalIndex: index };
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim();
                cleanedRow[cleanKey] = row[key];
              });
              return cleanedRow;
            });

            if (type === 'bom') {
              setBomData(data);
              setBomFile(file);
              setImportResults(prev => ({ ...prev, boms: [] }));
              showNotification('Fichier BOM CSV valide');
            } else {
              setProductData(data);
              setProductFile(file);
              setImportResults(prev => ({ ...prev, products: [] }));
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

  const parseBOMComposition = (compositionString) => {
    if (!compositionString || typeof compositionString !== 'string') {
      return [];
    }

    // Format attendu: (P2,1)+(P1,3)+(P3,4)
    const components = compositionString.match(/\(([^,]+),([^)]+)\)/g);
    if (!components) {
      return [];
    }

    return components.map(component => {
      const match = component.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          fk_product: match[1].trim(),
          qty: parseFloat(match[2]) || 1
        };
      }
      return null;
    }).filter(Boolean);
  };

  const processImport = async () => {
    if (!bomData.length || !productData.length) {
      showNotification('Veuillez importer les deux fichiers avant de continuer', 'error');
      return;
    }

    setImporting(true);
    const results = {
      products: [],
      boms: []
    };

    try {
      let successCount = 0;
      let errorCount = 0;

      // Traitement des produits d'abord
      showNotification('Traitement des produits en cours...', 'info');
      
      for (let i = 0; i < productData.length; i++) {
        const productItem = productData[i];
        const result = {
          index: productItem._originalIndex,
          data: productItem,
          status: 'processing',
          error: null,
          createdId: null
        };

        try {
          // Validation des champs obligatoires
          if (!productItem.produit_ref?.toString().trim()) {
            throw new Error('Référence produit manquante');
          }
          if (!productItem.produit_nom?.toString().trim()) {
            throw new Error('Nom produit manquant');
          }

          // Construction du payload pour l'API Dolibarr
          const productPayload = {
            ref: productItem.produit_ref.toString().trim(),
            label: productItem.produit_nom.toString().trim(),
            type: productItem.produit_type === 'Service' ? 1 : 0,
            status: 1, // Actif
            status_buy: 1, // Peut être acheté
            status_sell: 1, // Peut être vendu
          };

          // Ajouter le prix seulement s'il est défini et valide
          const prix = parseFloat(productItem.prix_vente);
          if (!isNaN(prix) && prix > 0) {
            productPayload.price = prix;
          }

          console.log(`Création produit ligne ${i + 1}:`, productPayload);
          
          const newProduct = await apiService.post('/products', productPayload);
          
          if (!newProduct || (!newProduct.id && !newProduct.success)) {
            throw new Error('Réponse API invalide: pas d\'ID retourné');
          }

          // L'ID peut être dans newProduct.id ou être le newProduct lui-même si c'est un nombre
          const productId = newProduct.id || (typeof newProduct === 'number' ? newProduct : null);
          
          if (productId) {
            result.createdId = productId;
            result.status = 'success';
            
            // Gestion du stock initial si présent
            const stockInitial = parseFloat(productItem.stock_initial);
            if (!isNaN(stockInitial) && stockInitial > 0) {
              try {
                const stockPayload = {
                  qty: stockInitial,
                  warehouse_id: 1, // Entrepôt par défaut
                  price: parseFloat(productItem.valeur_stock_initial) || 0
                };
                
                await apiService.post(`/products/${productId}/stock/correction`, stockPayload);
              } catch (stockError) {
                result.error = `Produit créé mais erreur stock: ${stockError.message}`;
                result.status = 'warning';
              }
            }
          } else {
            result.status = 'success';
            result.error = 'Produit créé (ID non retourné par l\'API)';
          }
          
          successCount++;
        } catch (error) {
          result.status = 'error';
          result.error = error.message || 'Erreur inconnue';
          console.error(`Erreur produit ligne ${i + 1}:`, error);
          errorCount++;
        }

        results.products.push(result);
        
        // Mise à jour progressive de l'affichage
        if (i % 5 === 0) {
          setImportResults({ ...results });
        }
      }

      showNotification('Traitement des BOM en cours...', 'info');

      // Traitement des BOM
      for (let i = 0; i < bomData.length; i++) {
        const bomItem = bomData[i];
        const result = {
          index: bomItem._originalIndex,
          data: bomItem,
          status: 'processing',
          error: null,
          createdId: null
        };

        try {
          // Validation des champs obligatoires
          if (!bomItem.bom_numero?.toString().trim()) {
            throw new Error('Numéro BOM manquant');
          }
          if (!bomItem.bom_libelle?.toString().trim()) {
            throw new Error('Libellé BOM manquant');
          }

          // Parser la composition
          const lines = parseBOMComposition(bomItem.bom_composition);

          const bomPayload = {
            ref: bomItem.bom_numero.toString().trim(),
            label: bomItem.bom_libelle.toString().trim(),
            bomtype: bomItem.bom_type === 'assembly' ? 1 : 0, 
            qty: parseFloat(bomItem.bom_qte) || 1,
            status: 1,
            fk_product: parseInt(bomItem.bom_produit) || null,
            lines: lines
          };

          // Ajouter le produit fini si spécifié
          if (bomItem.bom_produit?.toString().trim()) {
            bomPayload.fk_product = bomItem.bom_produit.toString().trim();
          }

          console.log(`Création BOM ligne ${i + 1}:`, bomPayload);
          const newBom = await apiService.post('/boms', bomPayload);
          
          const bomId = newBom.id || (typeof newBom === 'number' ? newBom : null);
          result.createdId = bomId;
          result.status = 'success';
          successCount++;
        } catch (error) {
          result.status = 'error';
          result.error = error.message || 'Erreur inconnue';
          console.error(`Erreur BOM ligne ${i + 1}:`, error);
          errorCount++;
        }

        results.boms.push(result);
        
        // Mise à jour progressive de l'affichage
        if (i % 5 === 0) {
          setImportResults({ ...results });
        }
      }

      setImportResults(results);
      
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return '';
    }
  };

  const clearResults = () => {
    setImportResults({ products: [], boms: [] });
    setBomData([]);
    setProductData([]);
    setBomFile(null);
    setProductFile(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Import de fichiers</h2>

        <div className="flex space-x-3">
          {/* Bouton de réinitialisation des données */}
          <ResetDataButton />
          
          {/* Bouton de réinitialisation des résultats existant */}
          {(importResults.products.length > 0 || importResults.boms.length > 0) && (
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center"
            >
              <X className="mr-2" size={16} />
              Réinitialiser
            </button>
          )}
        </div>
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Import BOM */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileSpreadsheet className="mr-2 text-blue-500" />
            Feuille 1 - Nomenclatures (BOM)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Colonnes attendues: bom_numero, bom_libelle, bom_type, bom_qte, bom_produit, bom_composition<br/>
            <span className="text-xs text-blue-600">Composition format: (produit,qté)+(produit,qté)</span>
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
            Colonnes attendues: produit_ref, produit_nom, produit_type, entrepot, stock_initial, valeur_stock_initial, prix_vente
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

      {/* Résultats d'import avec erreurs */}
      {importResults.products.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            Résultats Import Produits 
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {importResults.products.filter(p => p.status === 'success').length} succès / {importResults.products.length} total
            </span>
          </h4>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 border-b">Statut</th>
                    <th className="text-left p-3 border-b">Ligne</th>
                    <th className="text-left p-3 border-b">Référence</th>
                    <th className="text-left p-3 border-b">Nom</th>
                    <th className="text-left p-3 border-b">Stock</th>
                    <th className="text-left p-3 border-b">Prix</th>
                    <th className="text-left p-3 border-b">Erreur</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.products.map((result, index) => (
                    <tr key={index} className={`border-b ${getStatusColor(result.status)}`}>
                      <td className="p-3">
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-2 text-xs font-medium">
                            {result.status === 'success' ? 'OK' : 
                             result.status === 'warning' ? 'Partiel' : 'Erreur'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{result.index + 1}</td>
                      <td className="p-3">{result.data.produit_ref}</td>
                      <td className="p-3">{result.data.produit_nom}</td>
                      <td className="p-3">{result.data.stock_initial}</td>
                      <td className="p-3">{result.data.prix_vente} €</td>
                      <td className="p-3">
                        {result.error && (
                          <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded block mb-1">
                            {result.error}
                          </span>
                        )}
                        {result.createdId && (
                          <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                            ID: {result.createdId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {importResults.boms.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            Résultats Import BOM 
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {importResults.boms.filter(b => b.status === 'success').length} succès / {importResults.boms.length} total
            </span>
          </h4>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 border-b">Statut</th>
                    <th className="text-left p-3 border-b">Ligne</th>
                    <th className="text-left p-3 border-b">Numéro</th>
                    <th className="text-left p-3 border-b">Libellé</th>
                    <th className="text-left p-3 border-b">Type</th>
                    <th className="text-left p-3 border-b">Composition</th>
                    <th className="text-left p-3 border-b">Erreur</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.boms.map((result, index) => (
                    <tr key={index} className={`border-b ${getStatusColor(result.status)}`}>
                      <td className="p-3">
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-2 text-xs font-medium">
                            {result.status === 'success' ? 'OK' : 'Erreur'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{result.index + 1}</td>
                      <td className="p-3">{result.data.bom_numero}</td>
                      <td className="p-3">{result.data.bom_libelle}</td>
                      <td className="p-3">{result.data.bom_type}</td>
                      <td className="p-3 text-xs">{result.data.bom_composition}</td>
                      <td className="p-3">
                        {result.error && (
                          <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded block mb-1">
                            {result.error}
                          </span>
                        )}
                        {result.createdId && (
                          <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                            ID: {result.createdId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aperçu des données avant import */}
      {bomData.length > 0 && importResults.boms.length === 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Aperçu BOM ({bomData.length} entrées)</h4>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ligne</th>
                  <th className="text-left p-2">Numéro</th>
                  <th className="text-left p-2">Libellé</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Composition</th>
                </tr>
              </thead>
              <tbody>
                {bomData.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-mono text-xs">{item._originalIndex + 1}</td>
                    <td className="p-2">{item.bom_numero}</td>
                    <td className="p-2">{item.bom_libelle}</td>
                    <td className="p-2">{item.bom_type}</td>
                    <td className="p-2 text-xs">{item.bom_composition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bomData.length > 5 && <p className="text-xs text-gray-500 mt-2">... et {bomData.length - 5} autres entrées</p>}
          </div>
        </div>
      )}

      {productData.length > 0 && importResults.products.length === 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Aperçu Produits ({productData.length} entrées)</h4>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ligne</th>
                  <th className="text-left p-2">Référence</th>
                  <th className="text-left p-2">Nom</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Stock initial</th>
                  <th className="text-left p-2">Prix vente</th>
                </tr>
              </thead>
              <tbody>
                {productData.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-mono text-xs">{item._originalIndex + 1}</td>
                    <td className="p-2">{item.produit_ref}</td>
                    <td className="p-2">{item.produit_nom}</td>
                    <td className="p-2">{item.produit_type}</td>
                    <td className="p-2">{item.stock_initial}</td>
                    <td className="p-2">{item.prix_vente} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productData.length > 5 && <p className="text-xs text-gray-500 mt-2">... et {productData.length - 5} autres entrées</p>}
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

