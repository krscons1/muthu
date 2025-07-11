"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Download, Filter, TrendingUp, Clock, DollarSign, Plus } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { getClients, getClientOptions, getClientDisplayName, Client } from "@/lib/client-utils"
import type { DateRange } from "react-day-picker"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { getReports } from "@/lib/reports-utils"
import ProtectedRoute from "@/components/ProtectedRoute";

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

export default function ReportsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 20), // June 20, 2025
    to: new Date(2025, 5, 28), // June 28, 2025
  })
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [clientOptions, setClientOptions] = useState<string[]>([])
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (!user || loading) return null;

  useEffect(() => {
    if (!loading && user) {
      async function fetchClients() {
        try {
          const data = await getClients()
          setClients(data)
          setClientOptions(getClientOptions(data))
        } catch (err) {
          setClients([])
          setClientOptions([])
        }
      }
      fetchClients()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && user) {
      async function fetchReports() {
        try {
          const data = await getReports(dateRange?.from, dateRange?.to)
          setEntries(Array.isArray(data) ? data : [])
        } catch (err) {
          setEntries([])
        }
      }
      fetchReports()
    }
  }, [dateRange, user, loading])

  const filteredEntries = Array.isArray(entries) ? entries.filter((entry) => {
    const entryDate = new Date(entry.startTime)
    const inDateRange = !dateRange?.from || !dateRange?.to || (entryDate >= dateRange.from && entryDate <= dateRange.to)
    const matchesProject = selectedProject === "all" || entry.project === selectedProject
    const matchesClient = selectedClient === "all" || getClientDisplayName(clients, entry.client || "") === selectedClient

    return inDateRange && matchesProject && matchesClient
  }) : []

  const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const totalEntries = filteredEntries.length

  // Project breakdown
  const projectStats = filteredEntries.reduce(
    (acc, entry) => {
      const project = entry.project || "No Project"
      acc[project] = (acc[project] || 0) + entry.duration
      return acc
    },
    {} as Record<string, number>,
  )

  // Client breakdown - use display names
  const clientStats = filteredEntries.reduce(
    (acc, entry) => {
      const client = entry.client ? getClientDisplayName(clients, entry.client) : "No Client"
      acc[client] = (acc[client] || 0) + entry.duration
      return acc
    },
    {} as Record<string, number>,
  )

  // Daily breakdown
  const dailyStats = filteredEntries.reduce(
    (acc, entry) => {
      const date = new Date(entry.startTime).toDateString()
      acc[date] = (acc[date] || 0) + entry.duration
      return acc
    },
    {} as Record<string, number>,
  )

  const projects = [...new Set(entries.map((e) => e.project).filter(Boolean))]

  const exportData = () => {
    const csvContent = [
      ["Date", "Description", "Project", "Client", "Duration", "Start Time", "End Time"],
      ...filteredEntries.map((entry) => [
        new Date(entry.startTime).toLocaleDateString(),
        entry.description,
        entry.project || "",
        entry.client ? getClientDisplayName(clients, entry.client) : "",
        formatTime(entry.duration),
        new Date(entry.startTime).toLocaleTimeString(),
        entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "time-report.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateSampleData = () => {
    const sampleEntries = [
      {
        id: Date.now().toString() + "1",
        description: "Website homepage design",
        project: "Website Redesign",
        client: "Acme Corp",
        tags: ["design", "frontend"],
        startTime: new Date(2025, 5, 25, 9, 0),
        endTime: new Date(2025, 5, 25, 12, 30),
        duration: 12600,
      },
      {
        id: Date.now().toString() + "2",
        description: "Client meeting and requirements gathering",
        project: "Website Redesign",
        client: "Acme Corp",
        tags: ["meeting"],
        startTime: new Date(2025, 5, 26, 14, 0),
        endTime: new Date(2025, 5, 26, 15, 30),
        duration: 5400,
      },
      {
        id: Date.now().toString() + "3",
        description: "Mobile app wireframes",
        project: "Mobile App Development",
        client: "TechStart Inc",
        tags: ["design", "mobile"],
        startTime: new Date(2025, 5, 24, 10, 0),
        endTime: new Date(2025, 5, 24, 16, 0),
        duration: 21600,
      },
      {
        id: Date.now().toString() + "4",
        description: "API development and testing",
        project: "Mobile App Development",
        client: "TechStart Inc",
        tags: ["development", "backend"],
        startTime: new Date(2025, 5, 27, 9, 30),
        endTime: new Date(2025, 5, 27, 17, 0),
        duration: 27000,
      },
      {
        id: Date.now().toString() + "5",
        description: "Marketing campaign brainstorming",
        project: "Marketing Campaign",
        client: "Design Studio",
        tags: ["marketing", "planning"],
        startTime: new Date(2025, 5, 23, 13, 0),
        endTime: new Date(2025, 5, 23, 15, 30),
        duration: 9000,
      },
    ]

    setEntries(
      sampleEntries.map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : undefined,
      })),
    )

    toast({
      title: "Sample data generated",
      description: "Added 5 sample time entries to test the reports.",
    })
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Analyze your time tracking data</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateSampleData} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Data
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clientOptions.map((client: string) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProject("all")
                    setSelectedClient("all")
                    setDateRange({
                      from: new Date(new Date().setDate(new Date().getDate() - 7)),
                      to: new Date(),
                    })
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(totalDuration)}</div>
              <p className="text-xs text-muted-foreground">Across {totalEntries} entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(Object.keys(dailyStats).length > 0 ? totalDuration / Object.keys(dailyStats).length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per working day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(projectStats).length}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round((totalDuration / 3600) * 75)}</div>
              <p className="text-xs text-muted-foreground">At $75/hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Time by Project</CardTitle>
            <CardDescription>Breakdown of time spent on each project</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(projectStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(projectStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([project, duration]) => {
                    const percentage = (duration / totalDuration) * 100
                    return (
                      <div key={project} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{project}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                            <span className="font-mono">{formatTime(duration)}</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No project data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Time by Client</CardTitle>
            <CardDescription>Breakdown of time spent for each client</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(clientStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(clientStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([client, duration]) => {
                    const percentage = (duration / totalDuration) * 100
                    return (
                      <div key={client} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{client}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                            <span className="font-mono">{formatTime(duration)}</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No client data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Time Entries</CardTitle>
            <CardDescription>All time entries for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEntries.length > 0 ? (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{entry.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.project && <Badge variant="secondary">{entry.project}</Badge>}
                        {entry.client && <Badge variant="outline">{getClientDisplayName(clients, entry.client)}</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.startTime).toLocaleDateString()} •{" "}
                          {new Date(entry.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="font-mono">{formatTime(entry.duration)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No time entries found for the selected filters</div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
