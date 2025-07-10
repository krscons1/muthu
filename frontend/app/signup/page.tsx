"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
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

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard"); // or "/" if dashboard is at root
    }
  }, [user, router]);

  if (user) return null; // Prevent showing signup form if already logged in

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Helper to send Firebase ID token to backend
  const sendTokenToBackend = async (idToken: string) => {
    const res = await api.post(`/auth/firebase-login/`, { id_token: idToken })
    localStorage.setItem("token", res.data.token)
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      await sendTokenToBackend(idToken)
      toast({ title: "Signup successful", description: "Welcome!" })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const idToken = await userCredential.user.getIdToken()
      await sendTokenToBackend(idToken)
      toast({ title: "Signup successful", description: "Welcome!" })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Google signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Sign Up</CardTitle>
          <p className="text-slate-600 text-sm">Create your account to start tracking your time</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignup} className="space-y-6">
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
                placeholder="Create a password"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center font-medium">
                {error.includes("auth/email-already-in-use")
                  ? "This email is already registered. Please log in or use 'Forgot password?' to reset your password."
                  : error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold shadow-md hover:from-sky-600 hover:to-indigo-600"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="my-6 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500 uppercase">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 font-semibold border-slate-300 hover:bg-slate-100"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <FcGoogle className="h-5 w-5" /> Sign up with Google
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full mt-4 text-center text-blue-600 hover:underline"
            onClick={() => router.push("/login")}
            disabled={loading}
          >
            Already have an account? Log in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 