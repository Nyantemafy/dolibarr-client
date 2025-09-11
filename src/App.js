import React, { useState } from 'react';
import Navigation from './Navigation';
import DashboardScreen from './components/screen/DashboardScreen';
import StockManagementPage from './components/screen/liste/StockManagementPage';
import FileImportScreen from './components/screen/FileImportScreen';
import CreateOfScreen from './components/screen/create/CreateOfScreen';
import StockDynamicPage from './components/screen/create/StockDynamicPage';
import StockCorrectionForm from './components/screen/create/StockCorrectionForm';
import StockTransferForm from './components/screen/create/StockTransferForm';
import CreateProductScreen from './components/screen/create/CreateProductScreen';
import BatchManufacturingPage from './components/screen/create/BatchManufacturingPage';
import ManufacturingOrdersPage from './components/screen/liste/ManufacturingOrdersPage';
import ProductsManagementPage from './components/screen/liste/ProductsManagementPage';
import ProductsDetail from './components/screen/details/ProductsDetail';
import ProductsUpdateScreen from './components/screen/update/ProductsUpdateScreen';
import ManufacturingOrderDetail from './components/screen/details/ManufacturingOrderDetail';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customMenuItems, setCustomMenuItems] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleAddMenuItem = (newItem) => {
    setCustomMenuItems([...customMenuItems, newItem]);
  };

  const renderContent = () => {
    switch (activeTab) { 
      case 'dashboard':
        return <DashboardScreen />;
      case 'correct-stock':
        return <StockCorrectionForm />;
      case 'transfer-stock':
        return <StockTransferForm />;
      case 'creat-product':
        return <CreateProductScreen />;
      case 'stock-management':
        return <StockDynamicPage />;
      case 'products': 
        return <ProductsManagementPage setActiveTab={setActiveTab} setSelectedProductId={setSelectedProductId} />;
      case 'product-detail':
        return <ProductsDetail productId={selectedProductId} setActiveTab={setActiveTab}/>;
      case 'product-update':
        return <ProductsUpdateScreen productId={selectedProductId} setActiveTab={setActiveTab}/>;
      case 'stock':
        return <StockManagementPage />;
      case 'orders':
        return <ManufacturingOrdersPage setActiveTab={setActiveTab} setSelectedOrderId={setSelectedOrderId} />;
      case 'order-detail':
        return <ManufacturingOrderDetail orderId={selectedOrderId} setActiveTab={setActiveTab} />;
      case 'create-order':
        return <CreateOfScreen />;
      case 'multiple-product':
        return <BatchManufacturingPage />;
      case 'import':
        return <FileImportScreen />;
      default:
        // For custom menu items
        return <div className="p-6">Contenu de {activeTab}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        customMenuItems={customMenuItems}
        onAddMenuItem={handleAddMenuItem}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;