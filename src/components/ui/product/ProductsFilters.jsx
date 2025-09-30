import React, { useEffect, useState } from 'react';
import GenericFilters from '../general/GenericFilters';
import { WarehousesService } from '../../../services/warehousesService';

const ProductsFilters = ({ 
  filters, 
  setFilters, 
  onResetFilters 
}) => {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const list = await WarehousesService.getALLWarehouses();
        const options = list.map(w => ({
          value: w.id,
          label: w.label || w.ref
        }));
        // ajouter une option "Tous"
        setWarehouses([{ value: '', label: 'Tous les entrepôts' }, ...options]);
      } catch (error) {
        console.error("Erreur lors du chargement des entrepôts :", error);
      }
    };
    fetchWarehouses();
  }, []);

  const filterConfig = [
    {
      key: 'ref',
      label: 'Référence',
      type: 'text',
      placeholder: 'Rechercher par référence'
    },
    {
      key: 'label',
      label: 'Désignation',
      type: 'text',
      placeholder: 'Rechercher par désignation'
    },
    {
      key: 'priceMin',
      label: 'Prix min (€)',
      type: 'number',
      placeholder: 'Prix minimum',
      min: 0,
      step: 0.01
    },
    {
      key: 'priceMax',
      label: 'Prix max (€)',
      type: 'number',
      placeholder: 'Prix maximum',
      min: 0,
      step: 0.01
    },
    {
      key: 'warehouse',
      label: 'Entrepôt',
      type: 'select',
      options: warehouses
    },
    {
      key: 'finished',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'Tous les types' },
        { value: '0', label: 'Matière première' },
        { value: '1', label: 'Produit manufacturé' }
      ]
    }
  ];

  return (
    <GenericFilters
      filters={filters}
      setFilters={setFilters}
      onResetFilters={onResetFilters}
      filterConfig={filterConfig}
      title="Filtres Produits"
    />
  );
};

export default ProductsFilters;