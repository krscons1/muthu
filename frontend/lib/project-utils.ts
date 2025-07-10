import api from "./api"

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

export async function getProjects(): Promise<Project[]> {
  const res = await api.get(`/projects/`);
  return res.data;
}

export async function getProjectById(id: string): Promise<Project> {
  const res = await api.get(`/projects/${id}/`);
  return res.data;
}

export async function createProject(project: Omit<Project, "id" | "created_at">): Promise<Project> {
  const res = await api.post(`/projects/`, project);
  return res.data;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  const res = await api.patch(`/projects/${id}/`, project);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}/`);
} 