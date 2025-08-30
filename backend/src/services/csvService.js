class CsvService {
  parseBOMComposition(compositionString) {
    if (!compositionString || typeof compositionString !== 'string') {
      return [];
    }

    // Format attendu: (P2,1)+(P1,3)+(P3,4)
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

  validateCSVHeaders(headers, requiredHeaders) {
    const cleanHeaders = headers.map(h => h.trim().toLowerCase());
    const missing = requiredHeaders.filter(required => 
      !cleanHeaders.includes(required.toLowerCase())
    );
    
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }
}

module.exports = new CsvService();