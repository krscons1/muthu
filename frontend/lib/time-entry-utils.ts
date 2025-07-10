import api from "./api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface TimeEntry {
  id: string
  description: string
  project: string | null
  client: string | null
  tags: string[]
  start_time: string
  end_time?: string | null
  duration: number
  created_at: string
}

export async function getTimeEntries(): Promise<TimeEntry[]> {
  const res = await api.get(`/time-entries/`)
  return res.data
}

export async function getTimeEntryById(id: string): Promise<TimeEntry> {
  const res = await api.get(`/time-entries/${id}/`)
  return res.data
}

export async function createTimeEntry(entry: Omit<TimeEntry, "id" | "created_at">): Promise<TimeEntry> {
  const res = await api.post(`/time-entries/`, entry)
  return res.data
}

export async function updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
  const res = await api.patch(`/time-entries/${id}/`, entry)
  return res.data
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await api.delete(`/time-entries/${id}/`)
} 