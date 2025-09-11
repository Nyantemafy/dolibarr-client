import { useState, useEffect } from 'react';
import { BatchService } from '../services/batchService';
import { BomService } from '../services/bomService';

export const useBatchManufacturing = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [manufacturingQueue, setManufacturingQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturingResults, setManufacturingResults] = useState(null);

  const loadBoms = async () => {
    try {
      setBomLoading(true);
      const bomsData = await BomService.fetchBOMs();
      setBoms(bomsData);
    } catch (error) {
      throw error;
    } finally {
      setBomLoading(false);
    }
  };

  const addToQueue = (bomsList) => {
    if (!selectedBom || quantity <= 0) {
      throw new Error('Veuillez sélectionner un BOM et une quantité valide');
    }

    const bom = bomsList.find(b => b.id == selectedBom);
    if (!bom) {
      throw new Error('BOM non trouvé');
    }

    return {
      id: Date.now(),
      bom_id: bom.id,
      bom_ref: bom.ref,
      bom_label: bom.label,
      product_ref: bom.product_ref,
      product_label: bom.product_label,
      quantity: parseInt(quantity),
      totalValue: parseInt(quantity) * (bom.product_price || 0)
    };
  };

  const removeFromQueue = (id) => {
    setManufacturingQueue(prev => prev.filter(item => item.id !== id));
  };

  const startBatchManufacturing = async () => {
    if (manufacturingQueue.length === 0) {
      throw new Error('Aucun produit dans la queue de fabrication');
    }

    setLoading(true);
    try {
      const orders = manufacturingQueue.map(item => ({
        bom_id: item.bom_id,
        qty: item.quantity,
        label: `Fabrication lot ${item.bom_ref} - Qté: ${item.quantity}`
      }));

      const results = await BatchService.startBatchManufacturing(orders);
      setManufacturingResults(results);
      setManufacturingQueue([]);
      return results;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setManufacturingResults(null);
  };

  const filteredBoms = BatchService.filterBOMs(boms, searchTerm);
  const queueSummary = BatchService.calculateQueueSummary(manufacturingQueue);

  useEffect(() => {
    loadBoms();
  }, []);

  return {
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
    setQuantity,
    setSearchTerm,
    setManufacturingQueue,
    loadBoms,
    addToQueue,
    removeFromQueue,
    startBatchManufacturing,
    clearResults
  };
};