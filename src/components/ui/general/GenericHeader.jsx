import React from 'react';
import { RefreshCw } from 'lucide-react';

const GenericHeader = ({ 
  onRefresh, 
  loading, 
  title = "Titre", 
  subtitle = "Sous-titre", 
  buttonText = "Actualiser",
  buttonIcon: ButtonIcon = RefreshCw,
  buttonVariant = "primary",
  // Props pour la personnalisation supplémentaire
  className = "",
  titleClassName = "text-2xl font-bold text-gray-900",
  subtitleClassName = "text-gray-600",
  showButton = true,
  children // Pour du contenu personnalisé supplémentaire
}) => {
  
  const getButtonClasses = () => {
    const baseClasses = "px-4 py-2 rounded-lg flex items-center transition-colors duration-200";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
      danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400",
      success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
    };
    
    return `${baseClasses} ${variants[buttonVariant] || variants.primary}`;
  };

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h1 className={titleClassName}>{title}</h1>
        <p className={subtitleClassName}>{subtitle}</p>
        {children}
      </div>
      
      {showButton && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className={getButtonClasses()}
        >
          <ButtonIcon className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default GenericHeader;

// Utilisation : 
// 2. Pour les utilisateurs :
// jsx
// <GenericHeader
//   onRefresh={onRefreshUsers}
//   loading={usersLoading}
//   title="Utilisateurs"
//   subtitle="Gestion des comptes utilisateurs et permissions"
//   buttonText="Synchroniser"
//   buttonVariant="success"
// />
// 3. Sans bouton :
// jsx
// <GenericHeader
//   title="Tableau de Bord"
//   subtitle="Vue d'ensemble de l'activité"
//   showButton={false}
// />
// 4. Avec icône personnalisée :
// jsx
// import { Plus } from 'lucide-react';

// <GenericHeader
//   onRefresh={onAddNew}
//   loading={false}
//   title="Nouvel Élément"
//   subtitle="Création d'un nouvel élément"
//   buttonText="Créer"
//   buttonIcon={Plus}
//   buttonVariant="success"
// />
// 5. Avec contenu personnalisé supplémentaire :
// jsx
// <GenericHeader
//   title="Statistiques"
//   subtitle="Analyse des performances"
//   showButton={false}
// >
//   <div className="mt-2 flex space-x-4">
//     <span className="text-sm text-green-600">+15% ce mois-ci</span>
//     <span className="text-sm text-blue-600">120 commandes</span>
//   </div>
// </GenericHeader>
