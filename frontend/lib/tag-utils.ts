import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  usage_count: number
  created_at: string
}

export async function getTags(token: string): Promise<Tag[]> {
  const res = await axios.get(`${API_BASE_URL}/tags/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getTagById(id: string, token: string): Promise<Tag> {
  const res = await axios.get(`${API_BASE_URL}/tags/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function createTag(tag: Omit<Tag, "id" | "created_at" | "usage_count">, token: string): Promise<Tag> {
  const res = await axios.post(`${API_BASE_URL}/tags/`, tag, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateTag(id: string, tag: Partial<Tag>, token: string): Promise<Tag> {
  const res = await axios.patch(`${API_BASE_URL}/tags/${id}/`, tag, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteTag(id: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/tags/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
} 