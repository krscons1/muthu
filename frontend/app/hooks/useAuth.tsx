"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, User } from "firebase/auth";

// Extend context to include firebaseUser and idToken
const AuthContext = createContext<{
  user: object | null,
  loading: boolean,
  firebaseUser: User | null,
  idToken: string | null,
  refreshIdToken: () => Promise<void>,
  copyIdTokenToClipboard: () => Promise<void>, // new helper
}>({
  user: null,
  loading: true,
  firebaseUser: null,
  idToken: null,
  refreshIdToken: async () => {},
  copyIdTokenToClipboard: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<object | null>(null); // Django JWT user
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Helper to check for JWT
  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("django_jwt");
      if (token) {
        setUser({}); // You can decode the JWT for more info if needed
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  };

  // Listen for Django JWT changes (cross-tab)
  useEffect(() => {
    checkAuth();
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Listen for Firebase user changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
        // Store the Firebase ID token in localStorage for API utility
        localStorage.setItem('firebase_id_token', token);
      } else {
        setIdToken(null);
        localStorage.removeItem('firebase_id_token');
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to refresh the ID token manually
  const refreshIdToken = async () => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      setIdToken(token);
    }
  };

  // Function to copy the current ID token to clipboard
  const copyIdTokenToClipboard = async () => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      await navigator.clipboard.writeText(token);
      alert("Firebase ID token copied to clipboard! You can now paste it into the DRF web UI.");
    } else {
      alert("No Firebase user is logged in.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, firebaseUser, idToken, refreshIdToken, copyIdTokenToClipboard }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 