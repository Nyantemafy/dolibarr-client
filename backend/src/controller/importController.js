const csvService = require('../services/csvService');
const dolibarrService = require('../services/dolibarrService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

class ImportController {
  async importAll(req, res) {
    const createdProducts = [];
    const createdBOMs = [];

    try {
      const { products, boms } = req.body;

      if (!Array.isArray(products) || products.length === 0 ||
          !Array.isArray(boms) || boms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Products and BOMs must both be provided'
        });
      }

      // ---- Étape 1 : Validation ----
      products.forEach((p, i) => {
        const { error } = validationService.validateProduct(p);
        if (error) throw new Error(`Product line ${i + 1} validation failed: ${error.details[0].message}`);
      });

      boms.forEach((b, i) => {
        const { error } = validationService.validateBOM(b);
        if (error) throw new Error(`BOM line ${i + 1} validation failed: ${error.details[0].message}`);
      });

      // ---- Étape 2 : Vérification existence produits ----
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const existing = await dolibarrService.get(`/products?ref=${p.ref}`).catch(() => []);
        if (Array.isArray(existing) && existing.length > 0) {
          throw new Error(`Product line ${i + 1} already exists (ref=${p.ref})`);
        }
      }

      // ---- Étape 3 : Création produits ----
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const createdProduct = await dolibarrService.post('/products', p);

        let productId = null;

        if (typeof createdProduct === 'number') {
            productId = createdProduct;  
        } else {
            productId = createdProduct?.id || createdProduct?.rowid || createdProduct?.product?.id;
        }

        if (!productId) {
            throw new Error(`Produit créé mais aucun ID détecté pour ref=${p.ref}`);
        } else {
            console.log(`Produit créé avec ID=${productId} pour ref=${p.ref}`);
        }

        // Gestion stock initial
        const initialStock = parseFloat(p.stock_initial) || 0;
        const initialPrice = parseFloat(p.valeur_stock_initial) || 0;

        if (initialStock > 0) {
          await dolibarrService.post(`/stockmovements`, {
            product_id: productId,
            qty: initialStock,
            warehouse_id: 1,
            price: initialPrice,
            label: 'Stock initial import automatique'
          });
        }

        createdProducts.push(productId);
      }

      // ---- Étape 4 : Création BOMs ----
      for (let i = 0; i < boms.length; i++) {
        const b = boms[i];
        console.log('BOM actuel:', b);

        // Produit fini
        const finishedRef = b.bom_produit || b.fk_product;
        if (!finishedRef) throw new Error(`BOM ${i + 1} n'a pas de produit fini (champ bom_produit manquant)`);

        const finishedProduct = products.find(p => p.ref?.trim() === finishedRef?.trim());
        if (!finishedProduct) throw new Error(`Produit fini ${finishedRef} introuvable dans les produits`);

        const finishedIdx = products.indexOf(finishedProduct);
        const finishedId = createdProducts[finishedIdx];

        // Composition des composants
        let lines = [];
        if (Array.isArray(b.lines) && b.lines.length > 0) {
          lines = b.lines.map(line => {
            const comp = products.find(p => p.ref?.trim() === line.fk_product?.trim());
            if (!comp) throw new Error(`Composant ${line.fk_product} introuvable`);
            const compIdx = products.indexOf(comp);
            return { fk_product: createdProducts[compIdx], qty: line.qty };
          });
        }

        const bomPayload = {
          ref: b.ref,
          label: b.label,
          fk_product: finishedId,
          bomtype: b.bomtype ?? 0,
          qty: b.qty ?? 1,
          description: b.description ?? '',
          status: 1
        };

        try {
          console.log('Creating BOM with payload:', bomPayload);
          
          const createdBOM = await dolibarrService.post('/boms', bomPayload);
          console.log('BOM creation response:', createdBOM);
          
          // L'API Dolibarr retourne l'ID directement (pas d'objet avec propriété id/rowid)
          const bomId = createdBOM;
          
          if (!bomId || isNaN(bomId)) {
            console.error('Response structure:', createdBOM);
            throw new Error(`Erreur création BOM ${i + 1}: Aucun ID valide retourné. Réponse: ${JSON.stringify(createdBOM)}`);
          }
          
          console.log(`BOM créé avec ID=${bomId}`);
          createdBOMs.push(bomId);

          // Ajouter les lignes après création
          for (const line of lines) {
            try {
              await dolibarrService.post(`/boms/${bomId}/lines`, {
                fk_product: line.fk_product,
                qty: line.qty
              });
              console.log(`Ligne ajoutée pour le composant ${line.fk_product}`);
            } catch (lineError) {
              console.error(`Erreur lors de l'ajout de la ligne pour le composant ${line.fk_product}:`, lineError);
              throw lineError;
            }
          }
        } catch (error) {
          console.error('Erreur détaillée lors de la création du BOM:', error);
          throw error;
        }
      }
      res.json({ success: true, data: { products: createdProducts, boms: createdBOMs } });

    } catch (error) {
      logger.error('Import all failed, rollback...', error);

      // ---- Rollback automatique ----
      for (const bomId of createdBOMs) {
        try {
          await dolibarrService.delete(`/boms/${bomId}`);
        } catch (err) {
          logger.warn(`Impossible de supprimer le BOM ${bomId}: ${err.message}`);
        }
      }

      for (const productId of createdProducts) {
        try {
          await dolibarrService.delete(`/products/${productId}`);
        } catch (err) {
          logger.warn(`Impossible de supprimer le produit ${productId}: ${err.message}`);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Import failed, all changes rolled back',
        details: error.message
      });
    }
  }
}

module.exports = new ImportController();
