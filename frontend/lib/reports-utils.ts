import api from "./api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface ReportsData {
  total_duration: number
  total_entries: number
  project_stats: { project__name: string; total: number }[]
  client_stats: { client__name: string; total: number }[]
  daily_stats: { date: string; total: number }[]
}

export interface ReportsFilters {
  start?: string
  end?: string
  project?: string
  client?: string
  tag?: string
}

export async function getReports(filters: ReportsFilters = {}): Promise<ReportsData> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })
  const res = await api.get(`/reports/`, {
    params,
  })
  return res.data
} 