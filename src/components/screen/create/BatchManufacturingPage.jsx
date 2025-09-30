import { useBatchManufacturing } from '../../../hooks/useBatchManufacturing';
import { useNotification } from '../../../hooks/useNotification';

import BatchHeader from '../../ui/batchOF/BatchHeader';
import ProductSelection from '../../ui/batchOF/ProductSelection';
import ManufacturingQueue from '../../ui/batchOF/ManufacturingQueue';
import ManufacturingResults from '../../ui/batchOF/ManufacturingResults';
import BatchNotification from '../../ui/batchOF/Notification';

const BatchManufacturingPage = () => {
  const {
    boms,
    selectedBom,
    quantity,
    manufacturingQueue,
    loading,
    bomLoading,
    searchTerm,
    manufacturingResults,
    filteredBoms,
    queueSummary,
    setSelectedBom,
    setManufacturingQueue,
    setQuantity,
    setSearchTerm,
    dateCreation,
    setDateCreation,
    loadBoms,
    addToQueue,
    removeFromQueue,
    startBatchManufacturing,
    clearResults
  } = useBatchManufacturing();

  const { notification, showNotification, clearNotification } = useNotification();

  const handleAddToQueue = () => {
    try {
      const newItem = addToQueue(boms);
      setManufacturingQueue([...manufacturingQueue, newItem]);
      setSelectedBom('');
      setQuantity(1);
      showNotification(`${newItem.product_ref} ajouté à la queue de fabrication`);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleRemoveFromQueue = (id) => {
    removeFromQueue(id);
    showNotification('Élément retiré de la queue de fabrication');
  };

  const handleStartManufacturing = async () => {
    try {
      const results = await startBatchManufacturing();
      showNotification(
        `Fabrication terminée: ${results.successful} succès, ${results.failed} échecs`,
        results.failed === 0 ? 'success' : 'warning'
      );
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleNewManufacturing = () => {
    clearResults();
    loadBoms();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BatchHeader
        onRefresh={loadBoms}
        loading={bomLoading}
        title="Fabrication en Lot"
        subtitle="Planifiez et lancez la fabrication de plusieurs produits simultanément"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductSelection
          boms={boms}
          dateCreation={dateCreation}
          setDateCreation={setDateCreation}
          filteredBoms={filteredBoms}
          selectedBom={selectedBom}
          quantity={quantity}
          bomLoading={bomLoading}
          onBomChange={setSelectedBom}
          onQuantityChange={setQuantity}
          onAddToQueue={handleAddToQueue}
        />

        <ManufacturingQueue
          queue={manufacturingQueue}
          queueSummary={queueSummary}
          loading={loading}
          onRemoveItem={handleRemoveFromQueue}
          onStartManufacturing={handleStartManufacturing}
        />
      </div>

      <ManufacturingResults
        results={manufacturingResults}
        onClearResults={clearResults}
        onNewManufacturing={handleNewManufacturing}
      />

      <BatchNotification
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

export default BatchManufacturingPage;