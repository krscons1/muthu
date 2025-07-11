"use client"

import { useAuth } from "./hooks/useAuth";
import LoginPage from "./login/page";
import SignupPage from "./signup/page";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  // Always show login/signup UI for unauthenticated users
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", margin: 20 }}>
        <button onClick={() => setShowSignup(false)} style={{ marginRight: 10 }}>
          Login
        </button>
        <button onClick={() => setShowSignup(true)}>
          Signup
        </button>
      </div>
      {showSignup ? <SignupPage /> : <LoginPage />}
    </div>
  );
}
