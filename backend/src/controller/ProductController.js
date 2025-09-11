const dolibarrService = require('../services/dolibarrService');
const logger = require('../utils/logger');

class ProductController {
  async createProduct(req, res) {
    const productData = req.body;

    if (!productData.ref || !productData.label) {
      return res.status(400).json({ error: "Référence et label obligatoires" });
    }

    try {
      const payload = {
        ref: productData.ref,
        label: productData.label,
        finished: productData.type,      
        tosell: productData.tosell,
        tobuy: productData.tobuy,
        fk_default_warehouse: productData.fk_default_warehouse || 1, 
        price: productData.price || 0
      };

      const response = await dolibarrService.post('/products', payload);
      res.status(201).json(response);
    } catch (err) {
      logger.warn(`Impossible de créer le produit ${productData.ref}: ${err.message}`);
      res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
  }

  async updateProduct(req, res) {
    const productId = req.params.id;
    const productData = req.body;

    if (!productData.ref || !productData.label) {
      return res.status(400).json({ error: "Référence et label obligatoires" });
    }

    try {
      const payload = {
        ref: productData.ref,
        label: productData.label,
        finished: productData.type,
        tosell: productData.tosell,
        tobuy: productData.tobuy,
        fk_default_warehouse: productData.fk_default_warehouse || 1,
        price: productData.price || 0
      };

      const response = await dolibarrService.put(`/products/${productId}`, payload);
      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
  }

    async getProductByIdD(req, res) {
        const productId = req.params.id; 
        console.log('getProductById', productId);

        if (!productId) {
            return res.status(400).json({ error: "ID manquant" });
        }

        try {
            const product = await dolibarrService.get(`/products/${productId}`);
            if (!product) {
                return res.status(404).json({ error: "Produit non trouvé" });
            }
            res.json(product); 
        } catch (err) {
            logger.warn(`Impossible de récupérer le produit ${productId}: ${err.message}`);
            res.status(500).json({ error: "Erreur lors de la récupération du produit" });
        }
    }

    async getProductById(productId) {
        console.log('getProductById', productId);
        if (!productId) return null;
        try {
            return await dolibarrService.get(`/products/${productId}`);
        } catch (err) {
            logger.warn(`Impossible de récupérer le produit ${productId}: ${err.message}`);
            return null;
        }
    }

    async getAllProduct(req, res) {
        try {
          const products = await dolibarrService.get('/products');
          
          if (!Array.isArray(products)) {
            return res.json({ success: true, data: [] });
          }
    
          res.json({
            success: true,
            data: products
          });
    
        } catch (error) {
          logger.error('Error fetching products:', error);
          res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des products',
            details: error.message
          });
        }
    }

  async getFinishedProducts(req, res) {
    try {
      // 1. Récupérer tous les produits
      const products = await dolibarrService.get('/products');
      
      // 2. Filtrer les produits finis
      const finishedProducts = products.filter(p => Number(p.finished) === 1);
      
      // 3. Pour chaque produit fini, récupérer sa BOM et ses composants
      const productsWithBom = await Promise.all(
        finishedProducts.map(async (product) => {
          try {
            // Récupérer la BOM associée au produit
            const boms = await dolibarrService.get('/boms', {
              params: { product_id: product.id }
            });
            
            let bomWithLines = null;
            
            if (boms && boms.length > 0) {
              // Prendre la première BOM trouvée (ou la plus récente)
              const mainBom = boms[0];
              
              // Récupérer les lignes de la BOM
              const bomLines = await dolibarrService.get(`/boms/${mainBom.id}/lines`) || [];
              
              // Récupérer les détails des produits composants
              const lines = await Promise.all(
                bomLines.map(async (line) => {
                  const productId = line.fk_product || line.product_id;
                  
                  if (productId) {
                    try {
                      const componentProduct = await dolibarrService.get(`/products/${productId}`);
                      return {
                        ...line,
                        product: componentProduct || {
                          id: productId,
                          ref: line.product_ref || `PROD_${productId}`,
                          label: line.product_label || `Produit ${productId}`
                        }
                      };
                    } catch (err) {
                      console.warn(`❌ Produit composant ${productId} introuvable:`, err.message);
                      return {
                        ...line,
                        product: {
                          id: productId,
                          ref: line.product_ref || `PROD_${productId}`,
                          label: line.product_label || `Produit ${productId}`
                        }
                      };
                    }
                  }
                  return line;
                })
              );
              
              // CORRECTION ICI : utiliser "lines" au lieu de "components"
              bomWithLines = {
                ...mainBom,
                lines: lines  // ← Stocker dans "lines" au lieu de "components"
              };
            }
            
            return {
              ...product,
              bom: bomWithLines
            };
            
          } catch (error) {
            console.warn(`⚠️ Erreur pour le produit ${product.id}:`, error.message);
            return {
              ...product,
              bom: null,
              error: error.message
            };
          }
        })
      );
            
      res.json({
        success: true,
        data: productsWithBom
      });
      
    } catch (error) {
      logger.error('❌ Erreur récupération produits finis :', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des produits finis',
        details: error.message
      });
    }
  }
  
  async correctStock(req, res) {
    const { productId, warehouseId, action, quantity, purchasePrice } = req.body;

    if (!productId || !warehouseId || !quantity || !action) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    try {
      // Déterminer la quantité à envoyer au stockmovement
      const qty = parseFloat(quantity) * (action === 'add' ? 1 : -1);

      // Créer le stock movement
      const payload = {
        product_id: productId,
        warehouse_id: warehouseId,
        qty: qty,
        movementcode: `CORR-${Date.now()}`,
        movementlabel: "Correction stock",
        price: purchasePrice || 0
      };

      const response = await dolibarrService.post('/stockmovements', payload);

      res.status(200).json({ message: 'Stock corrigé', stockMovement: response });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la correction du stock' });
    }
  }

  async updateProducts(req, res) {
      try {
        const { id } = req.params;
        let updateData = req.body;
  
        if (!id || isNaN(id)) {
          return res.status(400).json({ success: false, error: "ID invalide" });
        }
    
        const updated = await dolibarrService.put(`/products/${id}`, updateData);
  
        return res.json({
          success: true,
          message: "Product mis à jour avec succès",
          data: {
            id: parseInt(id),
            ...updateData,
            ...(updated || {})
          }
        });
      } catch (error) {
        console.error("Error updating Product order:", error);
        return res.status(500).json({
          success: false,
          error: "Erreur lors de la mise à jour",
          details: error.message
        });
      }
    }
  
    async deleteProducts(req, res) {
      try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
          return res.status(400).json({ 
            success: false, 
            error: "ID du produit invalide" 
          });
        }
  
        logger.info(`Tentative de suppression du produit ${id}`);
  
        const order = await dolibarrService.get(`/products/${id}`);
        if (!order) {
          return res.status(404).json({ 
            success: false, 
            error: "Products non trouvé" 
          });
        }
  
        const result = await dolibarrService.delete(`/products/${id}`);
  
        logger.info(`Products ${id} supprimé avec succès`);
  
        res.json({
          success: true,
          message: 'Products supprimé avec succès',
          data: { id: parseInt(id) }
        });
  
      } catch (error) {
        logger.error(`Erreur lors de la suppression de l'products ${req.params.id}:`, error);
        
        // Gestion des erreurs spécifiques
        if (error.response?.status === 404) {
          return res.status(404).json({ 
            success: false, 
            error: 'Products non trouvé' 
          });
        }
  
        res.status(500).json({
          success: false,
          error: 'Erreur lors de la suppression de l\'products',
          details: error.message
        });
      }
    }

}

module.exports = new ProductController();