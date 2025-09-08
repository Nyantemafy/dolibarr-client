import React, { useState } from 'react';
import Navigation from './Navigation';
import DashboardScreen from './components/screen/DashboardScreen';
import StockManagementPage from './components/screen/liste/StockManagementPage';
import FileImportScreen from './components/screen/FileImportScreen';
import CreateOfScreen from './components/screen/create/CreateOfScreen';
import BatchManufacturingPage from './components/screen/create/BatchManufacturingPage';
import ManufacturingOrdersPage from './components/screen/liste/ManufacturingOrdersPage';
import ManufacturingOrderDetail from './components/screen/details/ManufacturingOrderDetail';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customMenuItems, setCustomMenuItems] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleAddMenuItem = (newItem) => {
    setCustomMenuItems([...customMenuItems, newItem]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
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