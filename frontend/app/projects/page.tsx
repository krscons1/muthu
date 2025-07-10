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
import { getProjects, createProject, updateProject, deleteProject, Project as ApiProject } from "@/lib/project-utils"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { toast } from "@/components/ui/use-toast";
import { getClients, Client } from "@/lib/client-utils";

interface Project extends ApiProject {}

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    color: "#3b82f6",
    status: "active" as const,
    description: "",
    due_date: "",
  })
  const [clients, setClients] = useState<Client[]>([]);
  const router = useRouter()

  const colors = ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"]

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
      return
    }
    if (!loading && user) {
      async function fetchProjects() {
        setIsLoading(true)
        try {
          const data = await getProjects()
          setProjects(data)
        } catch (err) {
          // handle error (show toast, etc)
        } finally {
          setIsLoading(false)
        }
      }
      async function fetchClientsList() {
        try {
          const data = await getClients();
          setClients(data);
        } catch (err) {
          // handle error (show toast, etc)
        }
      }
      fetchProjects()
      fetchClientsList()
    }
  }, [user, loading, router])

  if (!user || loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      if (editingProject) {
        const updated = await updateProject(editingProject.id, formData)
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        toast({ title: "Project updated", description: `Project '${updated.name}' updated successfully.` })
      } else {
        const created = await createProject(formData)
        setProjects((prev) => [...prev, created])
        toast({ title: "Project created", description: `Project '${created.name}' created successfully.` })
      }
      resetForm()
    } catch (err: any) {
      console.error("Create/Update Project Error:", err)
      toast({
        title: "Error",
        description: err?.message || "Failed to create or update project. Check your network and required fields.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      client: "",
      color: "#3b82f6",
      status: "active",
      description: "",
      due_date: "",
    })
    setEditingProject(null)
    setIsDialogOpen(false)
  }

  const editProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      client: project.client || "",
      color: project.color,
      status: project.status,
      description: project.description || "",
      due_date: project.due_date ? project.due_date.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    if (!user) return
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id)
        setProjects((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        // handle error (show toast, etc)
      }
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

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
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
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
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
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                    <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive">
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
                {project.due_date && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className={isOverdue(new Date(project.due_date)) ? "text-red-600 font-medium" : isDueToday(new Date(project.due_date)) ? "text-orange-600 font-medium" : "text-slate-500"}>
                      {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {isOverdue(new Date(project.due_date)) && (
                <p className="text-xs text-red-600 font-medium">Overdue</p>
              )}
              {isDueToday(new Date(project.due_date)) && (
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
