import axios from "axios";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      switch (status) {
        case 400:
          console.error("Bad Request:", error.response.data);
          break;
        case 401:
          console.error("Unauthorized:", error.response.data);
          // Handle unauthorized (e.g., redirect to login)
          break;
        case 403:
          console.error("Forbidden:", error.response.data);
          break;
        case 404:
          console.error("Not Found:", error.response.data);
          break;
        case 500:
          console.error("Server Error:", error.response.data);
          break;
        default:
          console.error("Error:", error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

