import api from "./api"

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

export async function getSettings(): Promise<Settings> {
  const res = await api.get(`/settings/`);
  return res.data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const res = await api.put(`/settings/`, settings);
  return res.data;
} 