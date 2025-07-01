import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  status: "active" | "inactive"
  created_at: string
}

export async function getClients(token: string): Promise<Client[]> {
  const res = await axios.get(`${API_BASE_URL}/clients/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function getClientById(id: string, token: string): Promise<Client> {
  const res = await axios.get(`${API_BASE_URL}/clients/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function createClient(client: Omit<Client, "id" | "created_at">, token: string): Promise<Client> {
  const res = await axios.post(`${API_BASE_URL}/clients/`, client, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateClient(id: string, client: Partial<Client>, token: string): Promise<Client> {
  const res = await axios.patch(`${API_BASE_URL}/clients/${id}/`, client, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteClient(id: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/clients/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getActiveClients(clients: Client[]): Client[] {
  return clients.filter((client) => client.status === "active")
}

export function getClientDisplayName(clients: Client[], clientIdentifier: string): string {
  const client = clients.find(
    (c) => c.company === clientIdentifier || c.name === clientIdentifier || c.id === clientIdentifier,
  )
  // Prefer company name over personal name for display
  return client ? client.company || client.name : clientIdentifier
}

export function getClientOptions(clients: Client[]): string[] {
  return getActiveClients(clients).map((client) => client.company || client.name)
}

export function findClientByIdentifier(clients: Client[], identifier: string): Client | null {
  return clients.find((c) => c.company === identifier || c.name === identifier || c.id === identifier) || null
}

export function getClientFullDetails(clients: Client[], identifier: string): {
  displayName: string
  email?: string
  phone?: string
  company?: string
  name: string
} | null {
  const client = findClientByIdentifier(clients, identifier)
  if (!client) return null
  return {
    displayName: client.company || client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    name: client.name,
  }
}
