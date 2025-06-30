"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FolderOpen, MoreHorizontal, Edit, Trash2, Users, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign",
      client: "Acme Corp",
      color: "#3b82f6",
      status: "active",
      description: "Complete redesign of company website",
      dueDate: new Date("2024-12-31"),
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Mobile App Development",
      client: "TechStart Inc",
      color: "#10b981",
      status: "active",
      description: "iOS and Android app development",
      dueDate: new Date("2024-07-15"),
      createdAt: new Date("2024-02-01"),
    },
    {
      id: "3",
      name: "Marketing Campaign",
      client: "Design Studio",
      color: "#10b981",
      status: "completed",
      description: "Q1 marketing campaign design and execution",
      createdAt: new Date("2024-01-01"),
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    color: "#3b82f6",
    status: "active" as const,
    description: "",
    dueDate: "",
  })

  const clients = ["Acme Corp", "TechStart Inc", "Design Studio", "Local Business"]
  const colors = ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"]

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    if (storedProjects.length > 0) {
      setProjects(
        storedProjects.map((project: any) => ({
          ...project,
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
          createdAt: new Date(project.createdAt),
        })),
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? {
                ...editingProject,
                ...formData,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
              }
            : p,
        ),
      )
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        createdAt: new Date(),
      }
      setProjects([...projects, newProject])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      client: "",
      color: "#3b82f6",
      status: "active",
      description: "",
      dueDate: "",
    })
    setEditingProject(null)
    setIsDialogOpen(false)
  }

  const editProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      client: project.client,
      color: project.color,
      status: project.status,
      description: project.description || "",
      dueDate: project.dueDate ? project.dueDate.toISOString().split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false
    return dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString()
  }

  const isDueToday = (dueDate?: Date) => {
    if (!dueDate) return false
    return dueDate.toDateString() === new Date().toDateString()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600">Manage your projects and track progress</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white hover:bg-gradient-secondary">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update project details below." : "Add a new project to your workspace."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-700">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client" className="text-slate-700">Client *</Label>
                <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status" className="text-slate-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-slate-700">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-700">Project Color</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-slate-400" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white hover:bg-gradient-secondary">
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="entry">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <CardTitle className="text-slate-900">{project.name}</CardTitle>
                    <CardDescription className="text-slate-600">{project.client}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editProject(project)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteProject(project.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && (
                <p className="text-sm text-slate-600">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                {project.dueDate && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className={isOverdue(project.dueDate) ? "text-red-600 font-medium" : isDueToday(project.dueDate) ? "text-orange-600 font-medium" : "text-slate-500"}>
                      {project.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {isOverdue(project.dueDate) && (
                <p className="text-xs text-red-600 font-medium">Overdue</p>
              )}
              {isDueToday(project.dueDate) && (
                <p className="text-xs text-orange-600 font-medium">Due today</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Create your first project to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary text-white hover:bg-gradient-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
