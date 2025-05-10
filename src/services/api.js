import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// API service methods
const api = {
  // Video processing endpoints
  videos: {
    async getTranscript(url) {
      try {
        const response = await apiClient.get("/videos/transcript", {
          params: { url },
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async validateVideo(url) {
      try {
        const response = await apiClient.get("/videos/validate", {
          params: { url },
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async getVideoMetadata(url) {
      try {
        const response = await apiClient.get("/videos/metadata", {
          params: { url },
        });
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
    async generateSummary(transcript) {
      try {
        const response = await apiClient.post("/ai/summary", { transcript });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async generateFlashcards(transcript) {
      try {
        const response = await apiClient.post("/ai/flashcards", { transcript });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    },

    async generateSlides(transcript, options) {
      try {
        const response = await apiClient.post("/ai/slides", {
          transcript,
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

  // Error handling helper
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "Server error";
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Request setup error
      throw new Error(error.message || "An error occurred");
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

export default api;
