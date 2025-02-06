import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API service methods
const api = {
  // Video processing endpoints
  videos: {
    async getTranscript(url) {
      try {
        const response = await apiClient.post("/videos/transcript", { url });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async uploadVideo(file) {
      try {
        const formData = new FormData();
        formData.append("video", file);

        const response = await apiClient.post("/videos/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },
  },

  // AI processing endpoints
  ai: {
    async generateSummary(text) {
      try {
        const response = await apiClient.post("/ai/summary", { text });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async generateFlashcards(text, options = {}) {
      try {
        const response = await apiClient.post("/ai/flashcards", {
          text,
          ...options,
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async generateSlides(text, options = {}) {
      try {
        const response = await apiClient.post("/ai/slides", {
          text,
          options,
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async generateAnswer(question, context) {
      try {
        const response = await apiClient.post("/ai/answer", {
          question,
          context,
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },
  },

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || "An error occurred";
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error("No response from server");
    } else {
      // Request setup error
      return new Error("Error setting up request");
    }
  },

  // Request interceptor
  setAuthToken(token) {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  },
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global error responses
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // You might want to redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

export default api;
