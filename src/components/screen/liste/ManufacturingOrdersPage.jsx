import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Play, FileText, Eye, Calendar, Trash2, Factory, Download, X } from 'lucide-react';
import apiService from '../../service/apiService';
import Notification from '../../indicateur/Notification'; 
import jsPDF from 'jspdf'; 
import autoTable from "jspdf-autotable";

const ManufacturingOrdersPage = ({ setActiveTab, setSelectedOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productLabels, setProductLabels] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    ref: '',
    label: '',
    product: '',
    qtyMin: '',
    qtyMax: '',
    dateFrom: '',
    dateTo: ''
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [ordersToExport, setOrdersToExport] = useState([]);

  const statusLabels = {
    0: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: '📝' },
    1: { label: 'Validé', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    2: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
    3: { label: 'Fabriqué', color: 'bg-green-100 text-green-800', icon: '🏭' }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      const allIds = new Set(filteredOrders.map(order => order.id));
      setSelectedOrders(allIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    
    // Mettre à jour selectAll si nécessaire
    if (newSelected.size === filteredOrders.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
  };

  const isOrderSelected = (orderId) => selectedOrders.has(orderId);

  const handleExportSelected = () => {
    const selectedIds = Array.from(selectedOrders);
    if (selectedIds.length === 0) {
      showNotification('Aucun ordre sélectionné', 'warning');
      return;
    }

    // Stocker les ordres à exporter et ouvrir la modal
    const ordersToExport = filteredOrders.filter(order => selectedIds.includes(order.id));
    setOrdersToExport(ordersToExport);
    setShowExportModal(true);
  };

  // Nouvelle fonction pour gérer le choix du format
  const handleExportFormat = (format) => {
    setShowExportModal(false);
    
    try {
      if (format === 'csv') {
        exportToCSV(ordersToExport);
      } else if (format === 'pdf') {
        exportToPDF(ordersToExport);
      } else if (format === 'pdf-table') {
        exportToPDFWithTable(ordersToExport);
      }
      
      showNotification(`${ordersToExport.length} ordre(s) exporté(s) en ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  // Fonction d'export CSV
  const exportToCSV = (orders) => {
    // Préparer les données CSV
    const csvHeaders = [
      'Référence',
      'Produit',
      'Quantité',
      'État',
      'Date création',
      'Date début prévue',
      'Date fin prévue'
    ];

    const csvData = orders.map(order => [
      order.ref,
      order.label,
      order.product?.label || order.product_ref,
      order.qty,
      statusLabels[order.status]?.label || 'Inconnu',
      new Date(order.date_creation).toLocaleDateString('fr-FR'),
      order.date_start_planned ? new Date(order.date_start_planned).toLocaleDateString('fr-FR') : '',
      order.date_end_planned ? new Date(order.date_end_planned).toLocaleDateString('fr-FR') : ''
    ]);

    // Créer le contenu CSV
    let csvContent = '\uFEFF'; // BOM pour UTF-8
    csvContent += csvHeaders.join(';') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(';') + '\n';
    });

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ordres_fabrication_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (orders) => {
    const doc = new jsPDF(); 

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Style pour le titre
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Export des Ordres de Fabrication', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date d'export
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Export du: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Pour chaque ordre
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const statusConfig = statusLabels[order.status];

      // Vérifier si on besoin d'une nouvelle page
      if (yPosition > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPosition = margin;
      }

      // En-tête de l'ordre
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Ordre: ${order.ref}`, margin, yPosition);
      yPosition += 7;

      // Détails de l'ordre
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const details = [
        `Produit: ${order.product?.label || order.product_ref}`,
        `Quantité: ${order.qty} unités`,
        `État: ${statusConfig.label}`,
        `Date création: ${new Date(order.date_creation).toLocaleDateString('fr-FR')}`,
        order.date_start_planned && `Début prévu: ${new Date(order.date_start_planned).toLocaleDateString('fr-FR')}`,
        order.date_end_planned && `Fin prévue: ${new Date(order.date_end_planned).toLocaleDateString('fr-FR')}`
      ].filter(Boolean);

      details.forEach(detail => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(detail, margin, yPosition);
        yPosition += 5;
      });

      // Séparateur entre les ordres
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }

    // Sauvegarder le PDF
    doc.save(`ordres_fabrication_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToPDFWithTable = async (orders) => {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(16);
    doc.text('Liste des Ordres de Fabrication', 14, 15);
    doc.setFontSize(10);
    doc.text(`Export du: ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

    // Préparer les données du tableau
    const tableData = orders.map(order => [
      order.ref,
      order.label,
      order.product?.label || order.product_ref,
      order.qty.toString(),
      statusLabels[order.status]?.label || 'Inconnu',
      new Date(order.date_creation).toLocaleDateString('fr-FR')
    ]);

    // En-têtes du tableau
    const headers = ['Référence', 'Produit', 'Quantité', 'État', 'Date Création'];

    // Générer le tableau
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Sauvegarder
    doc.save(`ordres_fabrication_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Array.from(selectedOrders);
    if (selectedIds.length === 0) {
      showNotification('Aucun ordre sélectionné', 'warning');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} ordre(s) ?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      // Appel API pour supprimer les ordres sélectionnés
      await Promise.all(
        selectedIds.map(id => 
          apiService.delete(`/api/manufacturing/delete/${id}`)
        )
      );
      
      // Mise à jour locale
      setOrders(prev => prev.filter(order => !selectedIds.includes(order.id)));
      setSelectedOrders(new Set());
      setSelectAll(false);
      
      showNotification(`${selectedIds.length} ordre(s) supprimé(s) avec succès`, 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression: ' + error.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/manufacturing/liste');
      console.log(response.data);
      setOrders(response.data || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des ordres de fabrication: ' + error.message, 'error');
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await apiService.get('/api/products/liste');
      console.log(response.data);
      setProductLabels(response.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const validateOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: true }));
      
      // Appel API pour valider l'ordre avec votre route POST
      await apiService.post(`/api/manufacturing/validation/${orderId}`);
      
      // Mise à jour locale
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 1 } : order
      ));
      
      showNotification('Ordre de fabrication validé avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la validation: ' + error.message, 'error');
      console.error('Erreur validation:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`validate_${orderId}`]: false }));
    }
  };

  const produceOrder = async (orderId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: true }));
      
      // Appel API pour consommer et produire avec votre route POST
      await apiService.post(`/api/manufacturing/produire/${orderId}`);

      // Mise à jour locale
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 3 } : order
      ));
      
      showNotification('Production terminée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la production: ' + error.message, 'error');
      console.error('Erreur production:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`produce_${orderId}`]: false }));
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const applyFilters = () => {
    let result = [...orders];

    // Filtre par statut
    if (filters.status !== '') {
      result = result.filter(order => order.status === parseInt(filters.status));
    }

    // Filtre par référence
    if (filters.ref) {
      result = result.filter(order => 
        order.ref.toLowerCase().includes(filters.ref.toLowerCase())
      );
    }

    // Filtre par produit
    if (filters.product) {
      result = result.filter(order => order.fk_product === parseInt(filters.product));
    }

    // Filtre par quantité minimale
    if (filters.qtyMin) {
      result = result.filter(order => order.qty >= parseInt(filters.qtyMin));
    }

    // Filtre par quantité maximale
    if (filters.qtyMax) {
      result = result.filter(order => order.qty <= parseInt(filters.qtyMax));
    }

    // Filtre par date de création
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.date_creation) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // Inclure toute la journée
      result = result.filter(order => new Date(order.date_creation) <= toDate);
    }

    setFilteredOrders(result);
  };

  // Mettre à jour les résultats filtrés quand les commandes ou les filtres changent
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  useEffect(() => {
    loadOrders();
    loadProduct();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordres de Fabrication</h1>
          <p className="text-gray-600">Gestion des ordres de fabrication et suivi de production</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
          Actualiser
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusLabels).map(([status, config]) => {
          const count = orders.filter(order => order.status === parseInt(status)).length;
          return (
            <div key={status} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-2xl">{config.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barre d'actions pour les éléments sélectionnés */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="text-blue-600 mr-2" size={20} />
              <span className="text-blue-800 font-medium">
                {selectedOrders.size} ordre(s) sélectionné(s)
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportSelected}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                title="Exporter les ordres sélectionnés"
              >
                <Download size={16} className="mr-2" />
                Exporter
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={actionLoading.delete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center"
                title="Supprimer les ordres sélectionnés"
              >
                {actionLoading.delete ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtres multicritères */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              {Object.entries(statusLabels).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre par référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              type="text"
              value={filters.ref}
              onChange={(e) => setFilters({...filters, ref: e.target.value})}
              placeholder="Filtrer par référence"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produits</label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({...filters, product: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les produits</option>
              {productLabels.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité min</label>
            <input
              type="number"
              value={filters.qtyMin}
              onChange={(e) => setFilters({...filters, qtyMin: e.target.value})}
              placeholder="Quantité minimale"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité max</label>
            <input
              type="number"
              value={filters.qtyMax}
              onChange={(e) => setFilters({...filters, qtyMax: e.target.value})}
              placeholder="Quantité maximale"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (début)</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de création (fin)</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bouton réinitialiser */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              status: '',
              ref: '',
              label: '',
              product: '',
              qtyMin: '',
              qtyMax: '',
              dateFrom: '',
              dateTo: ''
            })}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Table des ordres */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des ordres</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-gray-600">Chargement des ordres...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Factory className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">
              {orders.length === 0 ? 'Aucun ordre de fabrication trouvé' : 'Aucun résultat ne correspond aux filtres'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Produit</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Quantité</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">État</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date création</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const statusConfig = statusLabels[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isOrderSelected(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td 
                        className="px-4 py-3 cursor-pointer text-blue-600 hover:underline"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setActiveTab('order-detail');
                        }}
                      >
                        <div className="font-medium">{order.ref}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-gray-900">
                          <div className="font-medium">{order.product?.ref}</div>
                          <div className="text-sm text-gray-600">{order.product?.label}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium">{order.qty}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <span className="mr-1">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1" size={14} />
                          {new Date(order.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Bouton Voir */}
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Bouton Valider (si brouillon) */}
                          {order.status === 0 && (
                            <button
                              onClick={() => validateOrder(order.id)}
                              disabled={actionLoading[`validate_${order.id}`]}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                              title="Valider l'ordre"
                            >
                              {actionLoading[`validate_${order.id}`] ? (
                                <RefreshCw className="animate-spin" size={12} />
                              ) : (
                                <>
                                  <Check size={12} className="mr-1" />
                                  Valider
                                </>
                              )}
                            </button>
                          )}

                          {/* Bouton Produire (si validé) */}
                          {order.status === 1 && (
                            <button
                              onClick={() => produceOrder(order.id)}
                              disabled={actionLoading[`produce_${order.id}`]}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:bg-gray-400 flex items-center"
                              title="Produire (consommer et produire tout)"
                            >
                              {actionLoading[`produce_${order.id}`] ? (
                                <RefreshCw className="animate-spin" size={12} />
                              ) : (
                                <>
                                  <Play size={12} className="mr-1" />
                                  Produire
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dans l'en-tête de la table, remplacez ou ajoutez */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Liste des ordres</h2>
          {filteredOrders.length !== orders.length && (
            <p className="text-sm text-gray-600">
              {filteredOrders.length} résultat(s) sur {orders.length}
            </p>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de l'ordre de fabrication
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence</label>
                    <p className="text-gray-900 font-medium">{selectedOrder.ref}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">État</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[selectedOrder.status].color}`}>
                      <span className="mr-1">{statusLabels[selectedOrder.status].icon}</span>
                      {statusLabels[selectedOrder.status].label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produit à fabriquer</label>
                    <p className="text-gray-900">
                      <span className="font-medium">{selectedOrder.product?.ref}</span>
                      <br />
                      <span className="text-sm text-gray-600">{selectedOrder.product?.label}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantité</label>
                    <p className="text-gray-900 font-medium">{selectedOrder.qty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de création</label>
                    <p className="text-gray-900">{new Date(selectedOrder.date_creation).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date prévue</label>
                    <p className="text-gray-900">{new Date(selectedOrder.date_start_planned).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomenclature</label>
                  <p className="text-gray-900">{selectedOrder.bom?.ref}</p>
                </div>


                {/* Actions dans le modal */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedOrder.status === 0 && (
                    <button
                      onClick={() => {
                        validateOrder(selectedOrder.id);
                        setSelectedOrder(prev => ({ ...prev, status: 1 }));
                      }}
                      disabled={actionLoading[`validate_${selectedOrder.id}`]}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      {actionLoading[`validate_${selectedOrder.id}`] ? (
                        <RefreshCw className="animate-spin mr-2" size={16} />
                      ) : (
                        <Check className="mr-2" size={16} />
                      )}
                      Valider
                    </button>
                  )}

                  {selectedOrder.status === 1 && (
                    <button
                      onClick={() => {
                        produceOrder(selectedOrder.id);
                        setSelectedOrder(prev => ({ ...prev, status: 3 }));
                      }}
                      disabled={actionLoading[`produce_${selectedOrder.id}`]}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      {actionLoading[`produce_${selectedOrder.id}`] ? (
                        <RefreshCw className="animate-spin mr-2" size={16} />
                      ) : (
                        <Play className="mr-2" size={16} />
                      )}
                      Produire
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D'EXPORT - À AJOUTER ICI */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Format d'export
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Choisissez le format pour exporter {ordersToExport.length} ordre(s) sélectionné(s)
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleExportFormat('csv')}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
              >
                <FileText size={20} className="mr-2" />
                Export CSV
              </button>
              
              <button
                onClick={() => handleExportFormat('pdf')}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <FileText size={20} className="mr-2" />
                Export PDF (détail)
              </button>
              
              <button
                onClick={() => handleExportFormat('pdf-table')}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition-colors"
              >
                <FileText size={20} className="mr-2" />
                Export PDF (tableau)
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
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

export default ManufacturingOrdersPage;