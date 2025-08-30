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
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur GET ${endpoint}:`, error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur POST ${endpoint}:`, error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur PUT ${endpoint}:`, error);
      throw error;
    }
  }
};

export default apiService;