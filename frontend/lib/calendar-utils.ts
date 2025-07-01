import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface CalendarEntry {
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

export interface CalendarProject {
  id: string
  name: string
  client: string | null
  color: string
  status: string
  description?: string
  due_date?: string | null
  created_at: string
}

export interface CalendarData {
  entries: CalendarEntry[]
  projects: CalendarProject[]
}

export async function getCalendar(token: string, month: string): Promise<CalendarData> {
  const res = await axios.get(`${API_BASE_URL}/calendar/`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { month },
  })
  return res.data
} 