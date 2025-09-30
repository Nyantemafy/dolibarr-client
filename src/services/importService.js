import Papa from 'papaparse';
import apiService from '../components/service/apiService';

export class ImportService {
  static parseCSV(file, onComplete, onError) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimitersToGuess: [',', ';', '\t'],
      complete: onComplete,
      error: onError
    });
  }

  static async importAllData(importData) {
    try {
      const response = await apiService.post('/api/import/importAll', {
        ...importData,
        confirmed: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  static parseBOMComposition(compositionString) {
    if (!compositionString || typeof compositionString !== 'string') {
      return [];
    }

    const components = compositionString.match(/\(([^,]+),([^)]+)\)/g);
    if (!components) {
      return [];
    }

    return components.map(component => {
      const match = component.match(/\(([^,]+),([^)]+)\)/);
      if (match) {
        return {
          fk_product: match[1].trim(),
          qty: parseFloat(match[2]) || 1
        };
      }
      return null;
    }).filter(Boolean);
  }

  static prepareProductData(productData) {
    return productData.map((item) => ({
      ref: item.produit_ref?.toString().trim(),
      label: item.produit_nom?.toString().trim(),
      entrepot: item.entrepot?.toString().trim(),
      produit_type: item.produit_type?.toString().trim(),
      status: 1,
      status_buy: 1,
      status_sell: 1,
      price: parseFloat(item.prix_vente) || undefined,
      stock_initial: parseFloat(item.stock_initial) || undefined,
      valeur_stock_initial: parseFloat(item.valeur_stock_initial) || 0
    }));
  }

  static prepareBOMData(bomData) {
    return bomData.map((item) => ({
      ref: item.bom_numero?.toString().trim(),
      label: item.bom_libelle?.toString().trim(),
      bomtype: item.bom_type === 'assembly' ? 1 : 0,
      qty: parseFloat(item.bom_qte) || 1,
      status: 1,
      bom_produit: item.bom_produit?.toString().trim() || null,
      lines: this.parseBOMComposition(item.bom_composition)
    }));
  }
}