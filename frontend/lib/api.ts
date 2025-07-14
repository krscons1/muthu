import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  // For /auth/firebase-login/, do not attach any token
  if (config.url && config.url.includes("/auth/firebase-login/")) {
    return config;
  }
  // Always get the latest Django JWT from localStorage
  let jwtToken = null;
  if (typeof window !== "undefined") {
    jwtToken = localStorage.getItem("django_jwt");
  }
  if (jwtToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${jwtToken}`;
    return config;
  } else {
    // No JWT found, throw error to be caught by error handler
    throw new Error("No authentication token found. Please log in again.");
  }
});

export default api; 