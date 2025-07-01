"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Play, Calendar, TrendingUp, Target } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getTimeEntries, TimeEntry as ApiTimeEntry } from "@/lib/time-entry-utils"
import { getClients, Client as ApiClient } from "@/lib/client-utils"

interface TimeEntry extends ApiTimeEntry {}
interface Client extends ApiClient {}

export default function DashboardPage() {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [weeklyGoal] = useState(40 * 3600) // 40 hours in seconds
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [entriesData, clientsData] = await Promise.all([
          getTimeEntries(token),
          getClients(token),
        ])
        setEntries(entriesData)
        setClients(clientsData)
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "There was a problem loading your dashboard data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [token])

  // Safe calculations with error handling
  const todayTotal = entries
    .filter((entry) => {
      try {
        return new Date(entry.startTime).toDateString() === new Date().toDateString()
      } catch {
        return false
      }
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0)

  const weekTotal = entries
    .filter((entry) => {
      try {
        const entryDate = new Date(entry.startTime)
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return entryDate >= weekStart
      } catch {
        return false
      }
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0)

  const weekProgress = weeklyGoal > 0 ? Math.min((weekTotal / weeklyGoal) * 100, 100) : 0

  const projectStats = entries.reduce(
    (acc, entry) => {
      if (entry.project) {
        acc[entry.project] = (acc[entry.project] || 0) + (entry.duration || 0)
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topProjects = Object.entries(projectStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const getClientDisplayName = (clientId: string) => {
    try {
      const client = clients.find((c) => c.company === clientId || c.name === clientId || c.id === clientId)
      return client ? client.company || client.name : clientId
    } catch {
      return clientId
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your time tracking data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your time tracking activity</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Add Sample Data
          </Button>
          <Button variant="outline" size="sm">
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Current Timer */}
      {currentEntry && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Play className="h-5 w-5" />
              Currently Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{currentEntry.description}</div>
                {currentEntry.project && <div className="text-sm text-muted-foreground">{currentEntry.project}</div>}
              </div>
              <div className="text-2xl font-mono">
                {formatTime(Math.floor((Date.now() - new Date(currentEntry.startTime).getTime()) / 1000))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(todayTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {
                entries.filter((e) => {
                  try {
                    return new Date(e.startTime).toDateString() === new Date().toDateString()
                  } catch {
                    return false
                  }
                }).length
              }{" "}
              entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(weekTotal)}</div>
            <p className="text-xs text-muted-foreground">{Math.round(weekProgress)}% of weekly goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground">All time tracking records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(weeklyGoal)}</div>
            <Progress value={weekProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Top Projects</CardTitle>
          <CardDescription>Most tracked projects this period</CardDescription>
        </CardHeader>
        <CardContent>
          {topProjects.length > 0 ? (
            <div className="space-y-4">
              {topProjects.map(([project, duration]) => (
                <div key={project} className="flex items-center justify-between">
                  <div className="font-medium">{project}</div>
                  <div className="font-mono">{formatTime(duration)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No project data available yet</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest time entries</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries
                .slice(-10)
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.project && `${entry.project} • `}
                        {entry.client && `${getClientDisplayName(entry.client)} • `}
                        {new Date(entry.startTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-mono">{formatTime(entry.duration || 0)}</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No time entries yet. Start tracking your time!</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
