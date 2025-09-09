import { useState, useEffect } from 'react';
import { ValidationService } from '../services/validationService';

export const useImportPreview = (importData) => {
  const [previewData, setPreviewData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const validateImportData = async () => {
    if (!importData) return;

    setValidating(true);
    try {
      const response = await ValidationService.validateImportData(importData);
      
      if (response.success) {
        setPreviewData(response.data);
        setValidationResult({
          hasErrors: response.data.summary.hasErrors,
          hasWarnings: response.data.summary.hasWarnings,
          isValid: !response.data.summary.hasErrors
        });
      } else {
        setValidationResult({
          hasErrors: true,
          hasWarnings: false,
          isValid: false
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        hasErrors: true,
        hasWarnings: false,
        isValid: false
      });
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    validateImportData();
  }, [importData]);

  return {
    previewData,
    validating,
    validationResult,
    validateImportData,
    setPreviewData
  };
};