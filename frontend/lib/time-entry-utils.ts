import axios from "axios"

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

export async function getTimeEntries(token: string): Promise<TimeEntry[]> {
  const res = await axios.get(`${API_BASE_URL}/time-entries/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getTimeEntryById(id: string, token: string): Promise<TimeEntry> {
  const res = await axios.get(`${API_BASE_URL}/time-entries/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function createTimeEntry(entry: Omit<TimeEntry, "id" | "created_at">, token: string): Promise<TimeEntry> {
  const res = await axios.post(`${API_BASE_URL}/time-entries/`, entry, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateTimeEntry(id: string, entry: Partial<TimeEntry>, token: string): Promise<TimeEntry> {
  const res = await axios.patch(`${API_BASE_URL}/time-entries/${id}/`, entry, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteTimeEntry(id: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/time-entries/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
} 