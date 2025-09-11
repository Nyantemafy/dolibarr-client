import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { useNotification } from '../../../hooks/useNotification';
import ProductFields from '../../ui/product/ProductFields';
import { ArrowLeft } from 'lucide-react';

const ProductsDetail = ({ productId, setActiveTab }) => {
  console.log('productId', productId);
  const { showNotification } = useNotification();
  const { getById, product, loading } = useProducts(showNotification);
  const [currentProduct, setCurrentProduct] = useState(null);

    useEffect(() => {
    const fetchProduct = async () => {
        if (productId) {
        try {
            const productData = await getById(productId);
            console.log('Produit recu',productData);
            setCurrentProduct(productData);
        } catch (error) {
            console.error('Erreur lors du chargement du produit:', error);
        }
        }
    };

    fetchProduct();
    }, [productId]);

  const handleClose = () => {
    setActiveTab('products');
  };

  const handleEdit = (product) => {
    // Rediriger vers l'onglet d'édition ou ouvrir un modal d'édition
    console.log('Éditer le produit:', product);
    // setActiveTab('edit-product');
    // setProductToEdit(product);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement du produit...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Bouton de retour */}
      <button
        onClick={handleClose}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour à la liste des produits
      </button>

      <ProductFields
        product={currentProduct}
        onClose={handleClose}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ProductsDetail;