import api from "./api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  usage_count: number
  created_at: string
}

export async function getTags(): Promise<Tag[]> {
  const res = await api.get(`/tags/`);
  return res.data;
}

export async function getTagById(id: string): Promise<Tag> {
  const res = await api.get(`/tags/${id}/`);
  return res.data;
}

export async function createTag(tag: Omit<Tag, "id" | "created_at" | "usage_count">): Promise<Tag> {
  const res = await api.post(`/tags/`, tag);
  return res.data;
}

export async function updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
  const res = await api.patch(`/tags/${id}/`, tag);
  return res.data;
}

export async function deleteTag(id: string): Promise<void> {
  await api.delete(`/tags/${id}/`);
} 