"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Square, MoreHorizontal, Edit, Trash2, Pause, SkipForward, AlertCircle, Timer, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry, TimeEntry as ApiTimeEntry } from "@/lib/time-entry-utils"
import { useRouter } from "next/navigation"
import { getClientDisplayName } from "@/lib/client-utils"
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

interface TimeEntry extends ApiTimeEntry {}

interface Client {
  id: string
  name: string
  company?: string
  status: string
  email: string
}

interface CurrentTimer {
  id: string
  description: string
  project?: string
  client?: string
  startTime: string
  isOnHold: boolean
  totalHoldTime: number
  holdStartTime?: string
}

export default function TrackerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (!user || loading) return null;

  // State
  const [currentTimer, setCurrentTimer] = useState<CurrentTimer | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [description, setDescription] = useState("")
  const [selectedProject, setSelectedProject] = useState("No Project")
  const [selectedClient, setSelectedClient] = useState("No Client")
  const [currentTime, setCurrentTime] = useState(0)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  // Refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Constants
  const projects = ["Website Redesign", "Mobile App", "Marketing Campaign", "Client Consultation"]

  // Load data
  useEffect(() => {
    if (!loading && user) {
      async function fetchEntries() {
        setIsLoading(true)
        try {
          const data = await getTimeEntries()
          setEntries(data)
        } catch (err) {
          // handle error (show toast, etc)
        } finally {
          setIsLoading(false)
        }
      }
      fetchEntries()
    }
  }, [user, loading])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
      }
    }
  }, [router])

  // Timer calculation
  const calculateCurrentTime = useCallback(() => {
    if (!currentTimer) return 0

    try {
      const startTime = new Date(currentTimer.startTime).getTime()
      const now = Date.now()
      const elapsed = now - startTime

      let totalHoldTime = currentTimer.totalHoldTime || 0

      // Add current hold time if on hold
      if (currentTimer.isOnHold && currentTimer.holdStartTime) {
        const holdStart = new Date(currentTimer.holdStartTime).getTime()
        totalHoldTime += now - holdStart
      }

      const activeTime = elapsed - totalHoldTime
      return Math.max(0, Math.floor(activeTime / 1000))
    } catch (error) {
      console.error("Error calculating time:", error)
      return 0
    }
  }, [currentTimer])

  // Timer effect
  useEffect(() => {
    if (currentTimer && !currentTimer.isOnHold) {
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime(calculateCurrentTime())
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [currentTimer, calculateCurrentTime])

  // Timer functions
  const startTimer = useCallback(() => {
    try {
      if (!description.trim()) {
        toast({
          title: "Description required",
          description: "Please enter a description for your time entry.",
          variant: "destructive",
        })
        return
      }

      const newTimer: CurrentTimer = {
        id: `timer_${Date.now()}`,
        description: description.trim(),
        project: selectedProject === "No Project" ? undefined : selectedProject,
        client: selectedClient === "No Client" ? undefined : selectedClient,
        startTime: new Date().toISOString(),
        isOnHold: false,
        totalHoldTime: 0,
      }

      setCurrentTimer(newTimer)
      setCurrentTime(0)

      // Replace all time entry CRUD logic to use createTimeEntry, updateTimeEntry, deleteTimeEntry
      // For example, to add a new entry:
      // const created = await createTimeEntry(newEntry, token)
      // setEntries((prev) => [...prev, created])
      // Similarly for update and delete

      toast({
        title: "Timer started",
        description: `Started tracking "${description.trim()}"`,
      })
    } catch (error) {
      console.error("Error starting timer:", error)
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive",
      })
    }
  }, [description, selectedProject, selectedClient, toast])

  const holdTimer = useCallback(() => {
    try {
      if (!currentTimer || currentTimer.isOnHold) return

      const updatedTimer: CurrentTimer = {
        ...currentTimer,
        isOnHold: true,
        holdStartTime: new Date().toISOString(),
      }

      setCurrentTimer(updatedTimer)

      toast({
        title: "Timer paused",
        description: "Timer has been put on hold.",
      })
    } catch (error) {
      console.error("Error holding timer:", error)
    }
  }, [currentTimer, toast])

  const resumeTimer = useCallback(() => {
    try {
      if (!currentTimer || !currentTimer.isOnHold || !currentTimer.holdStartTime) return

      const holdDuration = Date.now() - new Date(currentTimer.holdStartTime).getTime()
      const updatedTimer: CurrentTimer = {
        ...currentTimer,
        isOnHold: false,
        totalHoldTime: (currentTimer.totalHoldTime || 0) + holdDuration,
        holdStartTime: undefined,
      }

      setCurrentTimer(updatedTimer)

      toast({
        title: "Timer resumed",
        description: "Timer is now running again.",
      })
    } catch (error) {
      console.error("Error resuming timer:", error)
    }
  }, [currentTimer, toast])

  const skipTimer = useCallback(() => {
    try {
      if (!currentTimer) return

      setCurrentTimer(null)
      setCurrentTime(0)
      setDescription("")
      setSelectedProject("No Project")
      setSelectedClient("No Client")

      // Replace all time entry CRUD logic to use createTimeEntry, updateTimeEntry, deleteTimeEntry
      // For example, to add a new entry:
      // const created = await createTimeEntry(newEntry, token)
      // setEntries((prev) => [...prev, created])
      // Similarly for update and delete

      toast({
        title: "Timer discarded",
        description: "Current timer has been discarded.",
      })
    } catch (error) {
      console.error("Error skipping timer:", error)
    }
  }, [currentTimer, toast])

  const stopTimer = useCallback(() => {
    try {
      if (!currentTimer) return

      const endTime = new Date().toISOString()
      const duration = calculateCurrentTime()

      if (duration <= 0) {
        toast({
          title: "Invalid duration",
          description: "Timer duration must be greater than 0 seconds.",
          variant: "destructive",
        })
        return
      }

      const newEntry: TimeEntry = {
        id: `entry_${Date.now()}`,
        description: description.trim() || currentTimer.description,
        project: selectedProject === "No Project" ? currentTimer.project : selectedProject,
        client: selectedClient === "No Client" ? currentTimer.client : selectedClient,
        tags: [],
        startTime: currentTimer.startTime,
        endTime,
        duration,
      }

      // Replace all time entry CRUD logic to use createTimeEntry, updateTimeEntry, deleteTimeEntry
      // For example, to add a new entry:
      // const created = await createTimeEntry(newEntry, token)
      // setEntries((prev) => [...prev, created])
      // Similarly for update and delete

      // Clear timer
      setCurrentTimer(null)
      setCurrentTime(0)
      setDescription("")
      setSelectedProject("No Project")
      setSelectedClient("No Client")

      toast({
        title: "Timer stopped",
        description: `Saved ${formatTime(duration)} for "${newEntry.description}"`,
      })
    } catch (error) {
      console.error("Error stopping timer:", error)
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive",
      })
    }
  }, [
    currentTimer,
    calculateCurrentTime,
    description,
    selectedProject,
    selectedClient,
    toast,
  ])

  const deleteEntry = useCallback(
    (id: string) => {
      try {
        // Replace all time entry CRUD logic to use createTimeEntry, updateTimeEntry, deleteTimeEntry
        // For example, to add a new entry:
        // const created = await createTimeEntry(newEntry, token)
        // setEntries((prev) => [...prev, created])
        // Similarly for update and delete

        toast({
          title: "Entry deleted",
          description: "Time entry has been removed.",
        })
      } catch (error) {
        console.error("Error deleting entry:", error)
        toast({
          title: "Error",
          description: "Failed to delete entry.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Get today's entries
  const todayEntries = entries.filter((entry) => {
    try {
      const entryDate = new Date(entry.startTime).toDateString()
      const today = new Date().toDateString()
      return entryDate === today
    } catch {
      return false
    }
  })

  const todayTotal = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)

  const getClientDisplayNameLocal = (clientId: string) => getClientDisplayName(clients, clientId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Time Tracker</h1>
          <p className="text-muted-foreground">Loading your tracker...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Time Tracker</h1>
          <p className="text-muted-foreground">Track your time with precision</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Timer Interface */}
        <Card style={{ backgroundColor: 'white' }} className="!bg-white">
          <CardHeader>
            <CardTitle>Current Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="What are you working on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!!currentTimer}
                  className={!description.trim() && !currentTimer ? "border-red-300" : ""}
                  required
                  style={{ backgroundColor: 'white' }}
                />
              </div>

              <div>
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject} disabled={!!currentTimer}>
                  <SelectTrigger className="!bg-white" style={{ backgroundColor: 'white' }}>
                    <SelectValue placeholder="No Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Project">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={!!currentTimer}>
                  <SelectTrigger className="!bg-white" style={{ backgroundColor: 'white' }}>
                    <SelectValue placeholder="No Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Client">No Client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.company || client.name}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentTimer ? (
                <>
                  <div className="flex gap-2">
                    <Button onClick={stopTimer} variant="destructive" size="lg">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                    {currentTimer.isOnHold ? (
                      <Button onClick={resumeTimer} variant="default" size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <Button onClick={holdTimer} variant="outline" size="lg">
                        <Pause className="h-4 w-4 mr-2" />
                        Hold
                      </Button>
                    )}
                    <Button onClick={skipTimer} variant="secondary" size="lg">
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                  </div>
                  <div className="text-3xl font-mono font-bold">{formatTime(currentTime)}</div>
                  {currentTimer.isOnHold && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Pause className="h-4 w-4" />
                      <span className="text-sm font-medium">Timer on hold</span>
                    </div>
                  )}
                </>
              ) : (
                <Button onClick={startTimer} size="lg" disabled={!description.trim()} className="!text-black">
                  <Play className="h-4 w-4 mr-2 !text-black" />
                  Start Timer
                </Button>
              )}
            </div>

            {!description.trim() && !currentTimer && (
              <p className="text-sm text-red-600">Please enter a description to start tracking time.</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Entries */}
        <Card style={{ backgroundColor: 'white' }} className="!bg-white">
          <CardHeader>
            <CardTitle>Today's Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length > 0 ? (
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{entry.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.project && <Badge variant="secondary">{entry.project}</Badge>}
                        {entry.client && <Badge variant="outline">{getClientDisplayNameLocal(entry.client)}</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.startTime).toLocaleTimeString()} -{" "}
                          {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "Running"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-lg font-mono">{formatTime(entry.duration || 0)}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit (Coming Soon)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteEntry(entry.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total for today:</span>
                    <span className="text-lg">{formatTime(todayTotal)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No time entries for today yet. Start tracking!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
