"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Helper to send Firebase ID token to backend
  const sendTokenToBackend = async (idToken: string) => {
    // You must implement this endpoint in your Django backend to verify the Firebase token and return a session/JWT
    const res = await axios.post(`${API_BASE_URL}/auth/firebase-login/`, { id_token: idToken })
    localStorage.setItem("token", res.data.token)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      await sendTokenToBackend(idToken)
      toast({ title: "Login successful", description: "Welcome back!" })
      router.push("/dashboard")
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
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
              <div className="text-red-600 text-sm text-center font-medium">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold shadow-md hover:from-sky-600 hover:to-indigo-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
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
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="h-5 w-5" /> Sign in with Google
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full mt-4 text-center text-blue-600 hover:underline"
            onClick={() => router.push("/signup")}
            disabled={loading}
          >
            Don&apos;t have an account? Sign up
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 