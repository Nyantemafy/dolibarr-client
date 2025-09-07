const csvService = require('../services/csvService');
const dolibarrService = require('../services/dolibarrService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');

class ImportController {
  async previewImport(req, res) {
    try {
      const { products, boms } = req.body;

      if (!Array.isArray(products) || products.length === 0 ||
          !Array.isArray(boms) || boms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Products and BOMs must both be provided'
        });
      }

      logger.info(`Preview import: ${products.length} produits, ${boms.length} BOMs`);

      // Validation complète avec vérifications métier
      const validationResults = await validationService.validateImportData(products, boms);

      res.json({
        success: true,
        preview: true,
        data: validationResults
      });

    } catch (error) {
      logger.error('Preview failed:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la prévisualisation',
        details: error.message
      });
    }
  }

  // Import avec validation préalable complète
  async importAll(req, res) {
    const createdProducts = [];
    const createdBOMs = [];

    try {
      const { products, boms, confirmed } = req.body;

      // Vérification de la confirmation
      if (!confirmed) {
        return res.status(400).json({
          success: false,
          error: 'L\'import doit être confirmé. Utilisez d\'abord l\'endpoint /preview.'
        });
      }

      if (!Array.isArray(products) || products.length === 0 ||
          !Array.isArray(boms) || boms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Products and BOMs must both be provided'
        });
      }

      logger.info(`Import starting: ${products.length} produits, ${boms.length} BOMs`);

      // ÉTAPE 1 : VALIDATION COMPLÈTE AVANT TOUT IMPORT
      console.log('=== ÉTAPE 1 : VALIDATION COMPLÈTE ===');
      const validationResults = await validationService.validateImportData(products, boms);
      
      // Si des erreurs sont détectées, arrêter immédiatement
      if (validationResults.summary.hasErrors) {
        const errorDetails = {
          products: validationResults.products.filter(p => !p.isValid),
          boms: validationResults.boms.filter(b => !b.isValid),
          summary: validationResults.summary
        };
        
        logger.error('Validation failed before import:', errorDetails);
        return res.status(400).json({
          success: false,
          error: 'Validation échouée : des erreurs ont été détectées',
          validationErrors: errorDetails,
          details: 'Corrigez les erreurs et réessayez'
        });
      }

      console.log('✅ Validation réussie - Début de l\'import');

      // ÉTAPE 2 : RÉCUPÉRATION DES DONNÉES EXISTANTES
      console.log('=== ÉTAPE 2 : RÉCUPÉRATION DES DONNÉES EXISTANTES ===');
      const [productsAll, warehousesAll] = await Promise.all([
        dolibarrService.get('/products').catch(() => []),
        dolibarrService.get('/warehouses').catch(() => [])
      ]);

      const existingRefs = productsAll.map(p => p.ref);
      const warehouseMap = new Map(); 
      warehousesAll.forEach(w => {
        if (w.ref) {
          const whId = w.rowid || w.id;   
          warehouseMap.set(w.ref.trim().toLowerCase(), whId);
        }
      });

      // ÉTAPE 3 : CRÉATION DES PRODUITS
      console.log('=== ÉTAPE 3 : CRÉATION DES PRODUITS ===');
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        console.log(`Traitement produit ${i + 1}/${products.length}: ${p.ref}`);

        // Vérification finale d'existence (sécurité supplémentaire)
        if (existingRefs.includes(p.ref)) {
          throw new Error(`ERREUR CRITIQUE: Produit ${p.ref} existe déjà (validation a échoué)`);
        }

        // Création du produit
        const createdProduct = await dolibarrService.post('/products', p);
        let productId = null;

        if (typeof createdProduct === 'number') {
          productId = createdProduct;  
        } else {
          productId = createdProduct?.id || createdProduct?.rowid || createdProduct?.product?.id;
        }

        if (!productId) {
          throw new Error(`Produit créé mais aucun ID détecté pour ref=${p.ref}`);
        }

        console.log(`✅ Produit créé avec ID=${productId} pour ref=${p.ref}`);
        createdProducts.push(productId);

        // Gestion du stock initial
        const initialStock = parseFloat(p.stock_initial) || 0;
        const initialPrice = parseFloat(p.valeur_stock_initial) || 0;

        if (initialStock > 0) {
          let warehouseId;
          const key = p.entrepot.trim().toLowerCase();
          
          if (warehouseMap.has(key)) {
            warehouseId = warehouseMap.get(key);
          } else {
            // Créer l'entrepôt
            const newWarehouse = await dolibarrService.post('/warehouses', { 
              ref: p.entrepot, 
              label: p.entrepot,
              statut: 1  
            });
            warehouseId = newWarehouse?.rowid || newWarehouse;
            warehouseMap.set(key, warehouseId);
            console.log(`✅ Nouvel entrepôt créé: ${p.entrepot} (ID=${warehouseId})`);
          }

          // Ajouter le stock initial
          await dolibarrService.post('/stockmovements', {
            product_id: productId,
            qty: initialStock,
            warehouse_id: warehouseId,
            price: initialPrice,
            label: 'Stock initial import automatique'
          });

          console.log(`✅ Stock initial ajouté pour produit ${p.ref}`);
        }
      }

      // ÉTAPE 4 : CRÉATION DES BOMs
      console.log('=== ÉTAPE 4 : CRÉATION DES BOMs ===');
      const bomsAll = await dolibarrService.get('/boms').catch(() => []);
      const existingBOMRefs = bomsAll.map(b => b.ref?.trim());

      for (let i = 0; i < boms.length; i++) {
        const b = boms[i];
        const bomRef = b.ref?.trim();
        console.log(`Traitement BOM ${i + 1}/${boms.length}: ${bomRef}`);

        // Vérification finale d'existence (sécurité supplémentaire)
        if (existingBOMRefs.includes(bomRef)) {
          throw new Error(`ERREUR CRITIQUE: BOM ${bomRef} existe déjà (validation a échoué)`);
        }

        // Recherche du produit fini
        const finishedRef = b.bom_produit || b.fk_product;
        const finishedProduct = products.find(p => p.ref?.trim() === finishedRef?.trim());
        if (!finishedProduct) {
          throw new Error(`ERREUR CRITIQUE: Produit fini ${finishedRef} introuvable (validation a échoué)`);
        }

        const finishedIdx = products.indexOf(finishedProduct);
        const finishedId = createdProducts[finishedIdx];

        // Préparation des lignes de composants
        let lines = [];
        if (Array.isArray(b.lines) && b.lines.length > 0) {
          lines = b.lines.map(line => {
            const comp = products.find(p => p.ref?.trim() === line.fk_product?.trim());
            if (!comp) {
              throw new Error(`ERREUR CRITIQUE: Composant ${line.fk_product} introuvable (validation a échoué)`);
            }
            const compIdx = products.indexOf(comp);
            return { fk_product: createdProducts[compIdx], qty: line.qty };
          });
        }

        // Création du BOM
        const bomPayload = {
          ref: bomRef,
          label: b.label,
          fk_product: finishedId,
          bomtype: b.bomtype ?? 0,
          qty: b.qty ?? 1,
          description: b.description ?? '',
          status: 1
        };

        const createdBOM = await dolibarrService.post('/boms', bomPayload);
        const bomId = createdBOM;
        
        if (!bomId || isNaN(bomId)) {
          throw new Error(`Erreur création BOM ${bomRef}: Aucun ID valide retourné`);
        }
        
        console.log(`✅ BOM créé avec ID=${bomId} pour ref=${bomRef}`);
        createdBOMs.push(bomId);

        // Ajout des lignes de composants
        for (const line of lines) {
          await dolibarrService.post(`/boms/${bomId}/lines`, {
            fk_product: line.fk_product,
            qty: line.qty
          });
          console.log(`✅ Ligne ajoutée pour le composant ${line.fk_product}`);
        }
      }

      // ÉTAPE 5 : SUCCÈS COMPLET
      console.log('=== IMPORT TERMINÉ AVEC SUCCÈS ===');
      logger.info(`Import completed successfully: ${createdProducts.length} produits, ${createdBOMs.length} BOMs créés`);
      
      res.json({ 
        success: true, 
        imported: true,
        data: { 
          products: createdProducts, 
          boms: createdBOMs 
        },
        summary: {
          productsCreated: createdProducts.length,
          bomsCreated: createdBOMs.length,
          message: 'Import terminé avec succès'
        }
      });

    } catch (error) {
      console.error('=== ERREUR DURANTE L\'IMPORT - ROLLBACK ===');
      logger.error('Import failed, starting rollback...', error);

      // ROLLBACK AUTOMATIQUE COMPLET
      let rollbackErrors = [];

      // Supprimer tous les BOMs créés
      for (const bomId of createdBOMs) {
        try {
          await dolibarrService.delete(`/boms/${bomId}`);
          console.log(`✅ BOM ${bomId} supprimé lors du rollback`);
        } catch (rollbackError) {
          const errorMsg = `Impossible de supprimer le BOM ${bomId}: ${rollbackError.message}`;
          rollbackErrors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }

      // Supprimer tous les produits créés
      for (const productId of createdProducts) {
        try {
          await dolibarrService.delete(`/products/${productId}`);
          console.log(`✅ Produit ${productId} supprimé lors du rollback`);
        } catch (rollbackError) {
          const errorMsg = `Impossible de supprimer le produit ${productId}: ${rollbackError.message}`;
          rollbackErrors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }

      // Réponse d'erreur avec détails du rollback
      const response = {
        success: false,
        error: 'Import échoué, toutes les modifications ont été annulées',
        details: error.message,
        rollback: {
          productsRolledBack: createdProducts.length,
          bomsRolledBack: createdBOMs.length,
          rollbackErrors: rollbackErrors.length > 0 ? rollbackErrors : undefined
        }
      };

      if (rollbackErrors.length > 0) {
        response.warning = 'Certains éléments n\'ont pas pu être supprimés lors du rollback';
      }

      res.status(500).json(response);
    }
  }
}

module.exports = new ImportController();