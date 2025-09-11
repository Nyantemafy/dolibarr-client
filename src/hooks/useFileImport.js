import { useState, useCallback } from 'react';
import { ImportService } from '../services/importService';
import { IMPORT_TYPES, STATUS_TYPES } from '../utils/importConstants';

export const useFileImport = () => {
  const [bomFile, setBomFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [bomData, setBomData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState({
    products: [],
    boms: []
  });

  const handleFileUpload = useCallback((file, type) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      ImportService.parseCSV(
        file,
        (results) => {
          try {
            const data = results.data.map((row, index) => {
              const cleanedRow = { _originalIndex: index };
              Object.keys(row).forEach(key => {
                const cleanKey = key.trim();
                cleanedRow[cleanKey] = row[key];
              });
              return cleanedRow;
            });

            if (type === IMPORT_TYPES.BOM) {
              setBomData(data);
              setBomFile(file);
              setImportResults(prev => ({ ...prev, boms: [] }));
            } else {
              setProductData(data);
              setProductFile(file);
              setImportResults(prev => ({ ...prev, products: [] }));
            }
          } catch (error) {
            throw new Error('Erreur lors du traitement du fichier CSV');
          }
        },
        (error) => {
          throw new Error('Erreur lors de la lecture du fichier CSV');
        }
      );
    } else {
      throw new Error('Format de fichier non supporté. Veuillez utiliser des fichiers CSV.');
    }
  }, []);

  const processImport = useCallback(async () => {
    setImporting(true);
    setImportResults({ products: [], boms: [] });

    try {
      const productsPayload = ImportService.prepareProductData(productData);
      const bomsPayload = ImportService.prepareBOMData(bomData);

      const response = await ImportService.importAllData({
        products: productsPayload,
        boms: bomsPayload
      });

      if (response.success) {
        setImportResults({
          products: productData.map((item, index) => ({
            index: index,
            data: item,
            status: STATUS_TYPES.SUCCESS,
            error: null,
            createdId: response.data.products[index] || null  
          })),
          boms: bomData.map((item, index) => ({
            index: index,
            data: item,
            status: STATUS_TYPES.SUCCESS, 
            error: null,
            createdId: response.data.boms[index] || null  
          }))
        });
      } else {
        throw new Error(response.data.error || 'Erreur lors de l\'import');
      }

      return { success: true };
    } catch (error) {
      setImportResults({
        products: productData.map((item, index) => ({
          index: index,
          data: item,
          status: STATUS_TYPES.ERROR,
          error: error.message,
          createdId: null
        })),
        boms: bomData.map((item, index) => ({
          index: index,
          data: item,
          status: STATUS_TYPES.ERROR,
          error: error.message,
          createdId: null
        }))
      });
      return { success: false, error: error.message };
    } finally {
      setImporting(false);
    }
  }, [bomData, productData]);

  const clearAll = useCallback(() => {
    setImportResults({ products: [], boms: [] });
    setBomData([]);
    setProductData([]);
    setBomFile(null);
    setProductFile(null);
  }, []);

  return {
    bomFile,
    productFile,
    bomData,
    productData,
    importing,
    importResults,
    setImporting,
    handleFileUpload,
    processImport,
    clearAll,
    setImportResults
  };
};