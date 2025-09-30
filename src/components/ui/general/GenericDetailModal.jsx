import React from 'react';
import { X } from 'lucide-react';

const GenericDetailModal = ({
  item,
  title = "Détails",
  onClose,
  actions = [],
  fields = [],
  className = "",
  overlayClassName = "bg-black bg-opacity-50",
  modalClassName = "bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto",
  // Props pour la personnalisation avancée
  renderHeader,
  renderFooter,
  children // Pour du contenu personnalisé
}) => {
  if (!item) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}>
      <div className={modalClassName}>
        <div className={`p-6 ${className}`}>
          {/* En-tête par défaut ou personnalisé */}
          {renderHeader ? (
            renderHeader(item, onClose)
          ) : (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {typeof title === 'function' ? title(item) : title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>
          )}

          {/* Contenu principal */}
          {children ? (
            children(item)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Affichage des champs configurés en grille 2x2 */}
              {fields.map((field, index) => (
                <div 
                  key={field.key || index} 
                  className={`p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-100 ${field.className || ""}`}
                >
                  {field.render ? (
                    field.render(item)
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {field.label}
                      </label>
                      <div className={field.valueClassName || "text-gray-900 font-medium"}>
                        {item[field.key]}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pied de page avec actions */}
          {actions.length > 0 && (
            renderFooter ? (
              renderFooter(item, actions)
            ) : (
              <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-gray-200">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.onClick(item)}
                    disabled={action.loading?.(item) || false}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm ${
                      action.variant === 'primary' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 shadow-blue-500/30' 
                        : action.variant === 'danger'
                        ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 shadow-red-500/30'
                        : action.variant === 'success'
                        ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 shadow-green-500/30'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 shadow-gray-400/20'
                    }`}
                    title={action.title}
                  >
                    {action.loading?.(item) && action.loadingIcon ? (
                      <>
                        {action.loadingIcon}
                        {action.loadingText || action.text}
                      </>
                    ) : (
                      <>
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.text}
                      </>
                    )}
                  </button>
                ))}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  Fermer
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericDetailModal;