import React, { useState } from 'react';
import { Upload, Package, FileSpreadsheet } from 'lucide-react';
import { useFileImport } from '../../hooks/useFileImport';
import { IMPORT_TYPES, BOM_COLUMNS, PRODUCT_COLUMNS } from '../../utils/importConstants';
import { ImportService } from '../../services/importService';
import Notification from '../indicateur/Notification';
import ResetDataButton from '../btn/ResetDataButton';
import ImportPreview from './ImportPreview';

import FileUploadCard from '../ui/import/FileUploadCard';
import ImportResultsTable from '../ui/import/ImportResultsTable';
import DataPreview from '../ui/import/DataPreview';
import ActionButtons from '../ui/import/ActionButtons';

const FileImportScreen = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const {
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
  } = useFileImport();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleFileUploadWithNotification = (file, type) => {
    try {
      handleFileUpload(file, type);
      showNotification(`Fichier ${type === IMPORT_TYPES.BOM ? 'BOM' : 'Produits'} CSV valide`);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handlePreview = () => {
    if (!bomData.length || !productData.length) {
      showNotification('Veuillez importer les deux fichiers avant de voir l\'aperçu', 'error');
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmImport = async (confirmedData) => {
    setImporting(true);
    setImportResults({ products: [], boms: [] });
    setShowPreview(false);

    try {
      showNotification('Import en cours...', 'info');

      const response = await ImportService.importAllData(confirmedData);

      if (response.success) {
        setImportResults({
          products: productData.map((item, index) => ({
            index: index,
            data: item,
            status: 'success',
            error: null,
            createdId: response.data.products[index] || null  
          })),
          boms: bomData.map((item, index) => ({
            index: index,
            data: item,
            status: 'success', 
            error: null,
            createdId: response.data.boms[index] || null  
          }))
        });
        showNotification('Import terminé avec succès !', 'success');
      } else {
        showNotification(response.data.error || 'Erreur lors de l import', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.error || error.message || 'Erreur inconnue', 'error');
    } finally {
      setImporting(false);
    }
  };

  const prepareImportData = () => {
    return {
      products: ImportService.prepareProductData(productData),
      boms: ImportService.prepareBOMData(bomData)
    };
  };

  const handleImportDirect = async () => {
    const result = await processImport();
    if (result.success) {
      showNotification('Import terminé avec succès !', 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  if (showPreview) {
    return (
      <ImportPreview
        importData={prepareImportData()}
        onBack={() => setShowPreview(false)}
        onConfirm={handleConfirmImport}
        isLoading={importing}
      />
    );
  }

  const productColumns = [
    { key: 'produit_ref', label: 'Référence' },
    { key: 'produit_nom', label: 'Nom' },
    { key: 'stock_initial', label: 'Stock' },
    { key: 'prix_vente', label: 'Prix' }
  ];

  const bomColumns = [
    { key: 'bom_numero', label: 'Numéro' },
    { key: 'bom_libelle', label: 'Libellé' },
    { key: 'bom_type', label: 'Type' },
    { key: 'bom_composition', label: 'Composition' }
  ];

  const dataMapper = (data, key) => data[key] || '—';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Import de fichiers</h2>
        <ResetDataButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FileUploadCard
          type={IMPORT_TYPES.BOM}
          file={bomFile}
          data={bomData}
          onFileUpload={handleFileUploadWithNotification}
          title="Feuille 1 - Nomenclatures (BOM)"
          icon={FileSpreadsheet}
          description="Colonnes attendues pour BOM"
        />

        <FileUploadCard
          type={IMPORT_TYPES.PRODUCT}
          file={productFile}
          data={productData}
          onFileUpload={handleFileUploadWithNotification}
          title="Feuille 2 - Produits et Stock"
          icon={Package}
          description="Colonnes attendues pour Produits"
        />
      </div>

      <ImportResultsTable
        results={importResults.products}
        title="Résultats Import Produits"
        columns={productColumns}
        dataMapper={dataMapper}
      />

      <ImportResultsTable
        results={importResults.boms}
        title="Résultats Import BOM"
        columns={bomColumns}
        dataMapper={dataMapper}
      />

      {/* <DataPreview
        data={bomData}
        title="Aperçu BOM"
        columns={bomColumns}
        dataMapper={dataMapper}
      />

      <DataPreview
        data={productData}
        title="Aperçu Produits"
        columns={productColumns}
        dataMapper={dataMapper}
      /> */}

      <ActionButtons
        onPreview={handlePreview}
        onImport={handleImportDirect}
        onReset={clearAll}
        importing={importing}
        hasBomData={bomData.length > 0}
        hasProductData={productData.length > 0}
        hasResults={importResults.products.length > 0 || importResults.boms.length > 0}
      />

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