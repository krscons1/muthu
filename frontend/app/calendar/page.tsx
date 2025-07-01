"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, FolderOpen } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { getCalendar, CalendarEntry, CalendarProject } from "@/lib/calendar-utils"
import { useRouter } from "next/navigation"

interface TimeEntry {
  id: string
  description: string
  project?: string
  client?: string
  tags: string[]
  startTime: Date
  endTime?: Date
  duration: number
}

interface Project {
  id: string
  name: string
  client: string
  color: string
  status: "active" | "completed" | "on-hold"
  description?: string
  dueDate?: Date
  createdAt: Date
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [projects, setProjects] = useState<CalendarProject[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  const router = useRouter()

  useEffect(() => {
    async function fetchCalendar() {
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
      try {
        const data = await getCalendar(token, month)
        setEntries(data.entries)
        setProjects(data.projects)
      } catch (err) {
        // handle error (show toast, etc)
      }
    }
    fetchCalendar()
  }, [token, currentDate])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      }
    }
  }, [router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => new Date(entry.startTime).toDateString() === date.toDateString())
  }

  const getProjectsForDate = (date: Date) => {
    return projects.filter((project) => project.dueDate && project.dueDate.toDateString() === date.toDateString())
  }

  const getTotalTimeForDate = (date: Date) => {
    return getEntriesForDate(date).reduce((sum, entry) => sum + entry.duration, 0)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : []
  const selectedDateProjects = selectedDate ? getProjectsForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View your time entries and project due dates in calendar format</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {monthName}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2 h-24" />
                  }

                  const dayEntries = getEntriesForDate(day)
                  const dayProjects = getProjectsForDate(day)
                  const totalTime = getTotalTimeForDate(day)
                  const isToday = day.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate?.toDateString() === day.toDateString()

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 h-24 border rounded-lg text-left hover:bg-accent transition-colors ${
                        isToday ? "border-primary bg-primary/5" : ""
                      } ${isSelected ? "bg-accent" : ""}`}
                    >
                      <div className="font-medium text-sm">{day.getDate()}</div>

                      {/* Time entries indicator */}
                      {totalTime > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">{formatTime(totalTime)}</div>
                      )}

                      {/* Visual indicators */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {/* Time entry dots */}
                        {dayEntries.slice(0, 2).map((entry, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-blue-500" title={entry.description} />
                        ))}

                        {/* Project due date indicators */}
                        {dayProjects.slice(0, 2).map((project, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                            title={`${project.name} due`}
                          />
                        ))}

                        {dayEntries.length + dayProjects.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEntries.length + dayProjects.length - 2}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
              </CardTitle>
              {selectedDate && (
                <CardDescription>
                  {selectedDateEntries.length} entries • {formatTime(getTotalTimeForDate(selectedDate))} total
                  {selectedDateProjects.length > 0 &&
                    ` • ${selectedDateProjects.length} project${selectedDateProjects.length > 1 ? "s" : ""} due`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {/* Project Due Dates */}
                  {selectedDateProjects.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Projects Due
                      </h4>
                      <div className="space-y-2">
                        {selectedDateProjects.map((project) => (
                          <div key={project.id} className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                              <div className="font-medium text-sm">{project.name}</div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Client: {project.client}</div>
                            {project.description && (
                              <div className="text-xs text-muted-foreground mt-1">{project.description}</div>
                            )}
                            <Badge variant="outline" className="mt-2 text-xs border-orange-300 text-orange-700">
                              Due Today
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Entries */}
                  {selectedDateEntries.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Entries
                      </h4>
                      <div className="space-y-2">
                        {selectedDateEntries.map((entry) => (
                          <div key={entry.id} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm">{entry.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {entry.project && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.project}
                                </Badge>
                              )}
                              {entry.client && (
                                <Badge variant="outline">
                                  {clients.find((c: any) => c.company === entry.client || c.name === entry.client)
                                    ?.company ||
                                    clients.find((c: any) => c.company === entry.client || c.name === entry.client)
                                      ?.name ||
                                    entry.client}
                                </Badge>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(entry.startTime).toLocaleTimeString()} -{" "}
                                {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "Running"}
                              </span>
                              <span className="font-mono">{formatTime(entry.duration)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDateEntries.length === 0 && selectedDateProjects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No time entries or project due dates for this date
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click on a date to view time entries and project due dates
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-mono">
                    {formatTime(
                      entries
                        .filter(
                          (entry) =>
                            new Date(entry.startTime).getMonth() === currentDate.getMonth() &&
                            new Date(entry.startTime).getFullYear() === currentDate.getFullYear(),
                        )
                        .reduce((sum, entry) => sum + entry.duration, 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Working Days:</span>
                  <span>
                    {
                      new Set(
                        entries
                          .filter(
                            (entry) =>
                              new Date(entry.startTime).getMonth() === currentDate.getMonth() &&
                              new Date(entry.startTime).getFullYear() === currentDate.getFullYear(),
                          )
                          .map((entry) => new Date(entry.startTime).toDateString()),
                      ).size
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Entries:</span>
                  <span>
                    {
                      entries.filter(
                        (entry) =>
                          new Date(entry.startTime).getMonth() === currentDate.getMonth() &&
                          new Date(entry.startTime).getFullYear() === currentDate.getFullYear(),
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projects Due:</span>
                  <span>
                    {
                      projects.filter(
                        (project) =>
                          project.dueDate &&
                          project.dueDate.getMonth() === currentDate.getMonth() &&
                          project.dueDate.getFullYear() === currentDate.getFullYear(),
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
