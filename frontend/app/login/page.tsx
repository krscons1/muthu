"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"
import { useAuth } from "../hooks/useAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

export default function LoginPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard"); // or "/" if dashboard is at root
    }
  }, [user, router]);

  if (user) return null; // Prevent showing login form if already logged in

  // Helper to send Firebase ID token to backend
  const sendTokenToBackend = async (idToken: string) => {
    try {
      const res = await api.post(`/auth/firebase-login/`, { id_token: idToken })
      localStorage.setItem("django_jwt", res.data.token)
      localStorage.setItem("django_refresh", res.data.refresh)
      localStorage.removeItem("token")
    } catch (err: any) {
      // Show backend error details if available
      let msg = "Login failed. Please try again.";
      if (err.response && err.response.data && err.response.data.detail) {
        msg = err.response.data.detail;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw err;
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (!userCredential.user) {
        setError("Firebase login failed. No user returned.");
        setLoading(false);
        return;
      }
      const idToken = await userCredential.user.getIdToken()
      await sendTokenToBackend(idToken)
      toast({ title: "Login successful", description: "Welcome back!" })
      console.log("JWT in localStorage:", localStorage.getItem("django_jwt"));
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const idToken = await userCredential.user.getIdToken()
      await sendTokenToBackend(idToken)
      toast({ title: "Login successful", description: "Welcome back!" })
      console.log("JWT in localStorage:", localStorage.getItem("django_jwt"));
      window.location.href = "/dashboard"; // Force reload to update context
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const emailPrompt = prompt("Enter your email to reset your password:", email);
    if (!emailPrompt) return;
    try {
      await sendPasswordResetEmail(auth, emailPrompt);
      toast({ title: "Password reset email sent!", description: "Check your inbox for reset instructions." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to send reset email.", variant: "destructive" });
    }
  };

  const handleTestFirebase = async () => {
    try {
      if (auth) {
        toast({ title: "Firebase connection successful!", description: auth.app.name });
      } else {
        toast({ title: "Firebase connection failed!", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Firebase connection failed!", description: err?.message || "Unknown error.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Time Tracker Login</CardTitle>
          <p className="text-slate-600 text-sm">Sign in to your account to track your time efficiently</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center font-medium">
                {error.includes("auth/invalid-credential")
                  ? "Invalid email or password. Please try again or use 'Forgot password?' to reset your password."
                  : error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold shadow-md hover:from-sky-600 hover:to-indigo-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="my-6 flex items-center justify-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-500 uppercase">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 font-semibold border-slate-300 hover:bg-slate-100"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle className="h-5 w-5" /> Sign in with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 font-semibold border-slate-300 hover:bg-slate-100 mt-4"
              onClick={() => router.push("/signup")}
              disabled={loading}
            >
              Register
            </Button>
            <div className="w-full mt-2 text-center">
              <button
                type="button"
                className="text-blue-600 hover:underline text-xs mt-2"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
            <div className="w-full mt-2 text-center">
              <button
                type="button"
                className="text-green-600 hover:underline text-xs mt-2"
                onClick={handleTestFirebase}
                disabled={loading}
              >
                Test Firebase Connection
              </button>
            </div>
            <div className="w-full mt-2 text-center">
              <Link href="/signup" className="text-blue-600 hover:underline">
                New user? Create an account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 