import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface Project {
  id: string
  name: string
  client: string | null
  color: string
  status: "active" | "completed" | "on-hold"
  description?: string
  due_date?: string | null
  created_at: string
}

export async function getProjects(token: string): Promise<Project[]> {
  const res = await axios.get(`${API_BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getProjectById(id: string, token: string): Promise<Project> {
  const res = await axios.get(`${API_BASE_URL}/projects/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function createProject(project: Omit<Project, "id" | "created_at">, token: string): Promise<Project> {
  const res = await axios.post(`${API_BASE_URL}/projects/`, project, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateProject(id: string, project: Partial<Project>, token: string): Promise<Project> {
  const res = await axios.patch(`${API_BASE_URL}/projects/${id}/`, project, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteProject(id: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/projects/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
} 