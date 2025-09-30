import { useState, useEffect } from 'react';
import { OrderService } from '../services/orderService';
import { BomService } from '../services/bomService';

export const useOrderForm = () => {
  const [boms, setBoms] = useState([]);
  const [dateCreation, setDateCreation] = useState('');
  const [selectedBom, setSelectedBom] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBoms, setLoadingBoms] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBoms = async () => {
    try {
      setLoadingBoms(true);
      setError('');
      const bomsData = await BomService.fetchBOMs();
      setBoms(bomsData);
    } catch (err) {
      setError(err.message);
      setBoms([]);
    } finally {
      setLoadingBoms(false);
    }
  };

  const handleBomChange = (bomId) => {
    setSelectedBom(bomId);
    
    // Auto-générer le label si pas encore défini
    if (!label && bomId) {
      const generatedLabel = OrderService.generateDefaultLabel(bomId, boms);
      setLabel(generatedLabel);
    }
  };

  const validateForm = () => {
    if (!selectedBom) {
      return 'Veuillez sélectionner une BOM';
    }
    
    if (!quantity || quantity <= 0) {
      return 'Veuillez saisir une quantité valide';
    }

    return null;
  };

  const resetForm = () => {
    setSelectedBom('');
    setQuantity(1);
    setLabel('');
    setDescription('');
    setError('');
    setSuccess('');
  };

  const submitOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return null;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    console.log("dateCreation log ::::", dateCreation);
    
    try {
      const orderData = {
        fk_bom: selectedBom,
        qty: quantity,
        date_creation: dateCreation
      };
        // label: label || OrderService.generateDefaultLabel(selectedBom, boms),
        // description: description

      const result = await OrderService.createOrder(orderData);
      setSuccess(`Ordre de fabrication créé avec succès (ID: ${result.id})`);
      resetForm();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  return {
    boms,
    selectedBom,
    quantity,
    label,
    description,
    loading,
    loadingBoms,
    error,
    success,
    setSelectedBom,
    setQuantity,
    setLabel,
    setDescription,
    setError,
    setSuccess,
    handleBomChange,
    submitOrder,
    resetForm,
    dateCreation,
    setDateCreation,
  };
};