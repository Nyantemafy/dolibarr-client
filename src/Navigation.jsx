import React, { useState } from 'react';
import { Upload, Package, Factory, ClipboardList, Home, Plus, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, customMenuItems = [], onAddMenuItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Menu de base avec structure hiérarchique
  const baseMenuStructure = {
    'liste': {
      label: 'Liste',
      icon: ClipboardList,
      items: [
        { id: 'products', label: 'Produits', icon: Package },
        { id: 'stock', label: 'Stock', icon: ClipboardList },
        { id: 'orders', label: 'Ordres de fabrication', icon: ClipboardList },
        { id: 'statistique', label: 'Statistique', icon: ClipboardList},
      ]
    },
    'creer': {
      label: 'Créer',
      icon: Plus,
      items: [
        { id: 'create-order', label: 'Ordre de fabrication', icon: Factory },
        { id: 'multiple-product', label: 'Fabrication Multiqple', icon: Factory },
        { id: 'correct-stock', label: 'Corriger une stock', icon: Factory },
        { id: 'creat-product', label: 'Cree une produit', icon: Factory },
        { id: 'creat-entrepo', label: 'Cree une entrepo', icon: Factory },
        { id: 'creat-bom', label: 'Cree une bom', icon: Factory },        
      ]
    },
    'dashboard': {
      label: 'Tableau de bord',
      icon: Home,
      standalone: true,
      id: 'dashboard'
    },
    'import': {
      label: 'Import fichiers',
      icon: Upload,
      standalone: true,
      id: 'import'
    }
  };

  // Fusionner avec les éléments personnalisés
  const mergeMenuItems = () => {
    const merged = { ...baseMenuStructure };
    
    customMenuItems.forEach(item => {
      if (item.category && !item.standalone) {
        if (!merged[item.category]) {
          merged[item.category] = {
            label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            items: [item]
          };
        } else {
          merged[item.category].items.push(item);
        }
      } else if (item.standalone) {
        merged[item.id] = item;
      }
    });
    
    return merged;
  };

  const menuData = mergeMenuItems();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu de navigation */}
      <nav className={`
        bg-gray-800 text-white w-64 min-h-screen p-4 fixed md:relative z-40 transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8">
          <h1 className="text-xl font-bold">GPAO Dolibarr</h1>
          <p className="text-gray-400 text-sm">Gestion de Production</p>
        </div>
        
        <ul className="space-y-2">
          {Object.entries(menuData).map(([key, section]) => {
            if (section.standalone) {
              const Icon = section.icon;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      setActiveTab(section.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === section.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3" size={18} />
                    {section.label}
                  </button>
                </li>
              );
            } else {
              const Icon = section.icon;
              const isExpanded = expandedSections[key];
              
              return (
                <li key={key}>
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon className="mr-3" size={18} />
                      {section.label}
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-2">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === item.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <ItemIcon className="mr-3" size={16} />
                              {item.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }
          })}
        </ul>
        
        {/* Liens additionnels en bas */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Liens utiles</h3>
          <ul className="space-y-2">
            <li>
              <a 
                href="http://localhost/dolibarr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm flex items-center transition-colors"
              >
                <span className="mr-2">🌐</span>
                Dolibarr Admin
              </a>
            </li>
            <li>
              <a 
                href="http://localhost/dolibarr/htdocs/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm flex items-center transition-colors"
              >
                <span className="mr-2">📋</span>
                API Documentation
              </a>
            </li>
            <li>
              <a 
                href="http://localhost/dolibarr/htdocs/api/index.php/products" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm flex items-center transition-colors"
              >
                <span className="mr-2">📦</span>
                Liste Produits
              </a>
            </li>
            <li>
              <a 
                href="http://localhost/dolibarr/htdocs/api/index.php/stock" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white text-sm flex items-center transition-colors"
              >
                <span className="mr-2">📊</span>
                Gestion Stock
              </a>
            </li>
          </ul>
        </div>
        
        {/* Informations API */}
        <div className="mt-6 p-3 bg-gray-900 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">API STATUS</h4>
          <div className="flex items-center text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Connecté à Dolibarr</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Clé API: ...{/* API_KEY.slice(-8) */}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;