"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Tag, MoreHorizontal, Edit, Trash2, Hash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TagItem {
  id: string
  name: string
  color: string
  description?: string
  usageCount: number
  createdAt: Date
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([
    {
      id: "1",
      name: "Development",
      color: "#3b82f6",
      description: "Software development tasks",
      usageCount: 45,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Design",
      color: "#10b981",
      description: "UI/UX design work",
      usageCount: 32,
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "3",
      name: "Meeting",
      color: "#10b981",
      description: "Client and team meetings",
      usageCount: 28,
      createdAt: new Date("2024-01-25"),
    },
    {
      id: "4",
      name: "Research",
      color: "#8b5cf6",
      description: "Research and planning",
      usageCount: 15,
      createdAt: new Date("2024-02-01"),
    },
    {
      id: "5",
      name: "Testing",
      color: "#ef4444",
      description: "Quality assurance and testing",
      usageCount: 12,
      createdAt: new Date("2024-02-05"),
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    description: "",
  })

  const colors = [
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTag) {
      setTags(tags.map((t) => (t.id === editingTag.id ? { ...editingTag, ...formData } : t)))
    } else {
      const newTag: TagItem = {
        id: Date.now().toString(),
        ...formData,
        usageCount: 0,
        createdAt: new Date(),
      }
      setTags([...tags, newTag])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3b82f6",
      description: "",
    })
    setEditingTag(null)
    setIsDialogOpen(false)
  }

  const editTag = (tag: TagItem) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || "",
    })
    setIsDialogOpen(true)
  }

  const deleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id))
  }

  const sortedTags = [...tags].sort((a, b) => b.usageCount - a.usageCount)
  const totalUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">Organize your time entries with tags</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
              <DialogDescription>
                {editingTag ? "Update tag details" : "Add a new tag to categorize your time entries"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter tag name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? "border-gray-400 scale-110" : "border-gray-200"} transition-transform`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tag description (optional)"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">{editingTag ? "Update" : "Create"} Tag</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Across all time entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedTags.length > 0 ? sortedTags[0].name : "None"}</div>
            <p className="text-xs text-muted-foreground">
              {sortedTags.length > 0 ? `${sortedTags[0].usageCount} uses` : "No usage yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tags List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>Manage your time tracking tags</CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="space-y-4">
              {sortedTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                    <div>
                      <div className="font-semibold">{tag.name}</div>
                      {tag.description && <div className="text-sm text-muted-foreground">{tag.description}</div>}
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {tag.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{tag.usageCount} uses</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editTag(tag)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteTag(tag.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No tags created yet</div>
          )}
        </CardContent>
      </Card>

      {/* Tag Cloud */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Cloud</CardTitle>
          <CardDescription>Visual representation of tag usage</CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag) => {
                const size = Math.max(
                  12,
                  Math.min(24, 12 + (tag.usageCount / Math.max(...tags.map((t) => t.usageCount))) * 12),
                )
                return (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    style={{
                      fontSize: `${size}px`,
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    {tag.name} ({tag.usageCount})
                  </Badge>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Create tags to see the tag cloud</div>
          )}
        </CardContent>
      </Card>

      {tags.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
            <p className="text-muted-foreground mb-4">Create your first tag to start organizing your time entries</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
