import React, { useState } from 'react';
import Notification from '../../indicateur/Notification';
import { AlertCircle, CheckCircle, Factory } from 'lucide-react';
import TextInput from '../../ui/CreatOF/TextInput';
import SubmitButton from '../../ui/CreatOF/SubmitButton';
import { WarehousesService } from '../../../services/warehousesService';

const CreateWarehouseScreen = ({ submitWarehouse }) => {
  const [ref, setRef] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

    const handleSubmit = async () => {
    if (!ref) {
        setNotification({ message: 'La référence est obligatoire', type: 'error' });
        return;
    }

    setLoading(true);
    try {
        const result = await WarehousesService.create(ref, label); 
        console.log(result)
        if (result.success) {
            setNotification({ message: `Entrepôt créé (ID: ${result.data.id})`, type: 'success' });
            setRef('');
            setLabel('');
        }
    } catch (err) {
        console.error(err);
        setNotification({ message: 'Erreur lors de la création de l\'entrepôt', type: 'error' });
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Factory className="mr-2 text-blue-600" size={20} />
          Création Entrepôt
        </h2>

        <div className="space-y-4">
          <TextInput label="Référence" value={ref} onChange={setRef} placeholder="Entrez la référence" />
          <SubmitButton loading={loading} onClick={handleSubmit} />

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
  );
};

export default CreateWarehouseScreen;
