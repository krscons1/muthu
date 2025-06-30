"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Square, Clock, TrendingUp, FolderOpen, Sparkles, Timer, Users, FileText, Calendar, Target } from "lucide-react"
import { formatTime } from "@/lib/utils"
import Link from "next/link"

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="welcome rounded-xl p-8 text-foreground bg-card relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to M-Track
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
            Professional time tracking made simple. Monitor your productivity, manage projects, and gain insights into your work patterns.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="!bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
              <Link href="/tracker">Start Tracking</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="!bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
              <Link href="/projects">View Projects</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">127.5</div>
            <p className="text-xs text-slate-500">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="stats-card bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">8</div>
            <p className="text-xs text-slate-500">+2 new this month</p>
          </CardContent>
        </Card>

        <Card className="stats-card bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clients</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500">+1 new client</p>
          </CardContent>
        </Card>

        <Card className="stats-card bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">94%</div>
            <p className="text-xs text-slate-500">+3% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Time Entries */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-500" />
              Recent Time Entries
            </CardTitle>
            <CardDescription>
              Your latest time tracking activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="entry p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Website Redesign</h4>
                  <p className="text-sm text-slate-500">Client: TechCorp Inc.</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">2h 30m</div>
                  <div className="text-xs text-slate-500">Today</div>
                </div>
              </div>
            </div>

            <div className="entry p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Content Creation</h4>
                  <p className="text-sm text-slate-500">Client: Marketing Pro</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">1h 45m</div>
                  <div className="text-xs text-slate-500">Yesterday</div>
                </div>
              </div>
            </div>

            <div className="entry p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Code Review</h4>
                  <p className="text-sm text-slate-500">Client: DevTeam LLC</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">3h 15m</div>
                  <div className="text-xs text-slate-500">2 days ago</div>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
              <Link href="/tracker">View All Entries</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="h-20 flex-col gap-2 !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
                <Link href="/tracker">
                  <Clock className="h-6 w-6" />
                  Start Timer
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col gap-2 !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
                <Link href="/projects">
                  <FileText className="h-6 w-6" />
                  New Project
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col gap-2 !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
                <Link href="/clients">
                  <Users className="h-6 w-6" />
                  Add Client
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex-col gap-2 !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
                <Link href="/calendar">
                  <Calendar className="h-6 w-6" />
                  View Calendar
                </Link>
              </Button>
            </div>

            <div className="pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Today's Goals</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Daily Target</span>
                    <span className="text-slate-900">6h / 8h</span>
                  </div>
                  <Progress value={75} className="h-2 !bg-white" style={{ backgroundColor: 'white' }} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Project Completion</span>
                    <span className="text-slate-900">3 / 5</span>
                  </div>
                  <Progress value={60} className="h-2 !bg-white" style={{ backgroundColor: 'white' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <Card style={{ backgroundColor: 'white' }} className="!bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-500" />
            Active Projects
          </CardTitle>
          <CardDescription>
            Current project status and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 !bg-white" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <h4 className="font-medium text-slate-900">Website Redesign</h4>
                  <p className="text-sm text-slate-500">TechCorp Inc. • Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-sky-100 text-sky-700">In Progress</Badge>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">75%</div>
                  <Progress value={75} className="w-20 h-2 !bg-white" style={{ backgroundColor: 'white' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 !bg-white" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <div>
                  <h4 className="font-medium text-slate-900">Mobile App Development</h4>
                  <p className="text-sm text-slate-500">StartupXYZ • Due in 12 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-sky-100 text-sky-700">Review</Badge>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">45%</div>
                  <Progress value={45} className="w-20 h-2 !bg-white" style={{ backgroundColor: 'white' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 !bg-white" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <h4 className="font-medium text-slate-900">Content Marketing</h4>
                  <p className="text-sm text-slate-500">Marketing Pro • Due in 3 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Planning</Badge>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">25%</div>
                  <Progress value={25} className="w-20 h-2 !bg-white" style={{ backgroundColor: 'white' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild variant="outline" className="w-full !bg-white !text-black !border-slate-300" style={{ backgroundColor: 'white', color: 'black', borderColor: '#e5e7eb' }}>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
