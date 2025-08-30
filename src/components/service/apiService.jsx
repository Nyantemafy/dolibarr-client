const API_BASE_URL = "http://localhost/dolibarr/htdocs/api/index.php";
const API_KEY = "wf1WlH719z7B4VyNwLeY3k18WScWHog8";

const apiHeaders = {
  "DOLAPIKEY": API_KEY,
  "Accept": "application/json",
  "Content-Type": "application/json"
};

const apiService = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: apiHeaders
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          if (errorText) {
            errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      console.log(`API POST ${endpoint}:`, data);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      console.log(`Réponse brute ${endpoint}:`, responseText);
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          }
        } catch {
          // Si ce n'est pas du JSON valide, utiliser le texte brut
          if (responseText) {
            errorMessage = `${errorMessage}: ${responseText.substring(0, 300)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Traiter la réponse de succès
      try {
        return JSON.parse(responseText);
      } catch {
        // Si la réponse n'est pas du JSON, retourner un objet avec le texte
        return { success: true, response: responseText };
      }
      
    } catch (error) {
      console.error(`Erreur POST ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      console.log(`API PUT ${endpoint}:`, data);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          if (responseText) {
            errorMessage = `${errorMessage}: ${responseText.substring(0, 200)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      try {
        return JSON.parse(responseText);
      } catch {
        return { success: true, response: responseText };
      }
      
    } catch (error) {
      console.error(`Erreur PUT ${endpoint}:`, error);
      throw error;
    }
  }
};

export default apiService;