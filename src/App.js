import React, { useState } from 'react';
import Navigation from './Navigation';
import DashboardScreen from './components/screen/DashboardScreen';
import StockScreen from './components/screen/StockScreen';
import FileImportScreen from './components/screen/FileImportScreen';
import CreateOfScreen from './components/screen/create/CreateOfScreen';
import ManufacturingOrdersPage from './components/screen/liste/ManufacturingOrdersPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customMenuItems, setCustomMenuItems] = useState([]);

  const handleAddMenuItem = (newItem) => {
    setCustomMenuItems([...customMenuItems, newItem]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'stock':
        return <StockScreen />;
      case 'orders':
        return <ManufacturingOrdersPage />;
      case 'create-order':
        return <CreateOfScreen />;
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