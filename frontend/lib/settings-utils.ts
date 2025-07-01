import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface Settings {
  id: string
  user: string
  timezone: string
  default_project: string | null
  auto_start: boolean
  reminder_interval: number
  weekly_goal: number
  email_notifications: boolean
  reminder_notifications: boolean
  weekly_reports: boolean
  time_format: string
  date_format: string
  theme: string
}

export async function getSettings(token: string): Promise<Settings> {
  const res = await axios.get(`${API_BASE_URL}/settings/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateSettings(settings: Partial<Settings>, token: string): Promise<Settings> {
  const res = await axios.put(`${API_BASE_URL}/settings/`, settings, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
} 