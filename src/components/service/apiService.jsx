const API_BASE_URL = "http://localhost:3001"; 

const apiHeaders = {
  "Accept": "application/json",
  "Content-Type": "application/json"
};

const apiService = {
  async get(endpoint) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log('GET Request URL:', fullUrl); 
      
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: apiHeaders
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          if (errorText) {
            errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Erreur GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`POST Request URL: ${fullUrl}`, data);
      
      const response = await fetch(fullUrl, {
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
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          if (responseText) {
            errorMessage = `${errorMessage}: ${responseText.substring(0, 300)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      try {
        const result = JSON.parse(responseText);
        return result;
      } catch {
        return { success: true, response: responseText };
      }
      
    } catch (error) {
      console.error(`Erreur POST ${endpoint}:`, error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log('DELETE Request URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: apiHeaders
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
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
        const result = JSON.parse(responseText);
        return result.data || result;
      } catch {
        return { success: true, response: responseText };
      }
      
    } catch (error) {
      console.error(`Erreur DELETE ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`PUT Request URL: ${fullUrl}`, data);
      
      const response = await fetch(fullUrl, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
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
        const result = JSON.parse(responseText);
        return result.data || result;
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