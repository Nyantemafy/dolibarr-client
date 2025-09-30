import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../services/productService';

export const useProducts = (showNotification) => {
  const [productLabels, setProductLabels] = useState([]);
  const [product, setProduct] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

 const getById = useCallback(async (productId) => {
    if (!productId) return;

    console.log('getProductById useCallback',productId);
    
    try {
      setLoading(true);
      const product = await ProductService.getProductById(productId);
      setProduct(product);
      return product;
    } catch (error) {
      showNotification('Erreur lors du chargement de l\'ordre', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductService.fetchProduct();
      setProductLabels(response || []);
    } catch (error) {
      showNotification(
        'Erreur lors du chargement des produits: ' + error.message,
        'error'
      );
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const loadFinishedProducts = async () => {
    try {
      const response = await ProductService.fetchFinishedProducts();
      console.log("✅ Produits finis:", response);
      setFinishedProducts(response || []);
    } catch (error) {
      console.error('❌ Erreur chargement produits finis:', error);
    }
  };

  const deleteProduct = useCallback(async (ProductIds) => {
    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      const ids = Array.isArray(ProductIds) ? ProductIds : [ProductIds]; // 👈 sécurité

      await Promise.all(
        ids.map(id => ProductService.deleteProduct(id))
      );
      
      setProductLabels(prev => prev.filter(order => !ProductIds.includes(order.id)));
      showNotification(`${ProductIds.length} ordre(s) supprimé(s) avec succès`, 'success');
      
      return true;
    } catch (error) {
      showNotification('Erreur lors de la suppression: ' + error.message, 'error');
      return false;
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  }, [showNotification]);

  const updateProduct = useCallback(async (ProductIds, updateData) => {
    try {
      setLoading(true);
      const response = await ProductService.updateProduct(ProductIds, updateData);
      console.log(response);
      
      if (response?.success) {
        setProduct(prev => ({ ...prev, ...updateData }));
        setProductLabels(prev =>
          prev.map(o => (o.id === ProductIds ? { ...o, ...updateData } : o))
        );
        return { success: true };
      } else {
        throw new Error(response?.error || "Erreur inconnue");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadFinishedProducts();
  }, []);

  return { productLabels, finishedProducts, loading, loadProducts, getById, deleteProduct, actionLoading, updateProduct, error, setProduct, product};
};
