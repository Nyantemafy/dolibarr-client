import React from 'react';
import { useOrderForm } from '../../../hooks/useOrderForm';
import Notification from '../../indicateur/Notification';
import { AlertCircle, CheckCircle, Factory } from 'lucide-react';

import CreateOrderHeader from '../../ui/CreatOF/CreateOrderHeader';
import FormMessage from '../../ui/CreatOF/FormMessage';
import BOMSelect from '../../ui/CreatOF/BOMSelect';
import QuantityInput from '../../ui/CreatOF/QuantityInput';
import DateInput from '../../ui/CreatOF/DateInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';

const CreateOfScreen = ({ onBack }) => {
  const {
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
    submitOrder,
    dateCreation,
    setDateCreation
  } = useOrderForm();

  const [notification, setNotification] = React.useState(null);

  const handleSubmit = async () => {
    const result = await submitOrder();
    if (result) {
      setNotification({ 
        message: `Ordre de fabrication créé avec succès (ID: ${result.id})`, 
        type: 'success' 
      });
    }
  };

  const handleBomChange = (bomId) => {
    setSelectedBom(bomId);
    
    // Auto-générer le label si pas encore défini
    if (!label && bomId) {
      const selectedBomData = boms.find(bom => bom.id == bomId);
      if (selectedBomData) {
        setLabel(`Ordre - ${selectedBomData.label || selectedBomData.ref}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <CreateOrderHeader />
      
      {error && (
        <FormMessage 
          type="error" 
          message={error} 
          icon={AlertCircle} 
        />
      )}
      
      {success && (
        <FormMessage 
          type="success" 
          message={success} 
          icon={CheckCircle} 
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Factory className="mr-2 text-blue-600" size={20} />
          Informations de l'ordre
        </h2>

        <div className="space-y-6">
          <BOMSelect
            boms={boms}
            selectedBom={selectedBom}
            onChange={handleBomChange}
            loading={loadingBoms}
          />

          <QuantityInput
            value={quantity}
            onChange={setQuantity}
          />

          <DateInput
            dateValue={dateCreation}
            onChange={setDateCreation}
          />

          {/* <TextInput
            value={label}
            onChange={setLabel}
            label="Libellé de l'ordre"
            placeholder="Libellé automatique basé sur la BOM"
            description="Laissez vide pour générer automatiquement"
          />

          <TextInput
            value={description}
            onChange={setDescription}
            label="Description (optionnel)"
            placeholder="Informations complémentaires sur cet ordre..."
            multiline={true}
            rows={3}
          /> */}

          <div className="pt-4 border-t">
            <SubmitButton
              loading={loading}
              disabled={!selectedBom || !quantity || loadingBoms}
              onClick={handleSubmit}
            />

            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOfScreen;