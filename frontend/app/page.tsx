"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Square, Clock, TrendingUp, FolderOpen, Sparkles, Timer, Users, FileText, Calendar, Target } from "lucide-react"
import { formatTime } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TimeEntry {
  id: string
  description: string
  project?: string
  client?: string
  tags: string[]
  startTime: string
  endTime?: string
  duration: number
}

interface CurrentTimer {
  id: string
  description: string
  project?: string
  client?: string
  startTime: string
  isOnHold: boolean
  totalHoldTime: number
}

export default function HomePage() {
  const [currentTimer, setCurrentTimer] = useState<CurrentTimer | null>(null)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const router = useRouter();

  const safeGetItem = (key: string): any => {
    try {
      if (typeof window === "undefined") return null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  }

  const safeSetItem = (key: string, value: any): boolean => {
    try {
      if (typeof window === "undefined") return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  }

  const safeRemoveItem = (key: string): boolean => {
    try {
      if (typeof window === "undefined") return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }

  const calculateCurrentTime = () => {
    if (!currentTimer) return 0

    try {
      const startTime = new Date(currentTimer.startTime).getTime()
      const now = Date.now()
      const elapsed = now - startTime
      const totalHoldTime = currentTimer.totalHoldTime || 0
      const activeTime = elapsed - totalHoldTime
      return Math.max(0, Math.floor(activeTime / 1000))
    } catch (error) {
      console.error("Error calculating time:", error)
      return 0
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (currentTimer && !currentTimer.isOnHold) {
      interval = setInterval(() => {
        setCurrentTime(calculateCurrentTime())
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [currentTimer])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const loadData = () => {
    try {
      const entries = safeGetItem("timeEntries") || []
      if (Array.isArray(entries)) {
        const validEntries = entries.filter(
          (entry: any) => entry && entry.id && entry.startTime && typeof entry.duration === "number",
        )
        setRecentEntries(validEntries.slice(-5))

        const today = new Date().toDateString()
        const todayEntries = validEntries.filter((entry: TimeEntry) => {
          try {
            return new Date(entry.startTime).toDateString() === today
          } catch {
            return false
          }
        })
        const total = todayEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.duration || 0), 0)
        setTodayTotal(total)
      }

      const timer = safeGetItem("currentTimer")
      if (timer && timer.id && timer.startTime) {
        setCurrentTimer(timer)
        setCurrentTime(calculateCurrentTime())
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const startTimer = () => {
    try {
      if (currentTimer) {
        alert("Timer already running. Please stop the current timer before starting a new one.")
        return
      }

      const newTimer: CurrentTimer = {
        id: `timer_${Date.now()}`,
        description: "Quick timer entry",
        startTime: new Date().toISOString(),
        isOnHold: false,
        totalHoldTime: 0,
      }

      setCurrentTimer(newTimer)
      setCurrentTime(0)

      if (safeSetItem("currentTimer", newTimer)) {
        console.log("Timer started successfully")
      }
    } catch (error) {
      console.error("Error starting timer:", error)
      alert("Failed to start timer. Please try again.")
    }
  }

  const stopTimer = () => {
    try {
      if (!currentTimer) return

      const endTime = new Date().toISOString()
      const duration = calculateCurrentTime()

      if (duration <= 0) {
        alert("Timer duration must be greater than 0 seconds.")
        return
      }

      const newEntry: TimeEntry = {
        id: `entry_${Date.now()}`,
        description: currentTimer.description,
        project: currentTimer.project,
        client: currentTimer.client,
        tags: [],
        startTime: currentTimer.startTime,
        endTime,
        duration,
      }

      const existingEntries = safeGetItem("timeEntries") || []
      const updatedEntries = [...existingEntries, newEntry]

      if (safeSetItem("timeEntries", updatedEntries)) {
        setCurrentTimer(null)
        setCurrentTime(0)
        safeRemoveItem("currentTimer")
        setRecentEntries(updatedEntries.slice(-5))
        setTodayTotal((prev) => prev + duration)

        console.log(`Timer stopped. Saved ${formatTime(duration)} for "${newEntry.description}"`)
      }
    } catch (error) {
      console.error("Error stopping timer:", error)
      alert("Failed to stop timer. Please try again.")
    }
  }

  return null;
}
