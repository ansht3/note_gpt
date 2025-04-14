import axios from "axios";

// Create an instance of axios with a base URL
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error or perform other actions
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
