import axios from "axios";
import { auth } from "@/lib/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
});

api.interceptors.request.use(async (config) => {
  // For /auth/firebase-login/, do not attach any token
  if (config.url && config.url.includes("/auth/firebase-login/")) {
    return config;
  }
  // Always get the latest Firebase ID token from Firebase Auth
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : null;
  if (idToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

export default api; 