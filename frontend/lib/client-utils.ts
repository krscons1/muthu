import api from "./api"
import { getAuth } from "firebase/auth"

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

async function getFirebaseToken(): Promise<string> {
  const auth = getAuth();
  // Wait for the user to be loaded if not immediately available
  let user = auth.currentUser;
  if (!user) {
    // Try to wait for the user to be set (in case of slow auth)
    await new Promise((resolve) => setTimeout(resolve, 500));
    user = auth.currentUser;
  }
  if (!user) throw new Error("User not authenticated. Please log in again.");
  // Always force refresh the token to avoid expired tokens
  return await user.getIdToken(true);
}

export async function getClients(): Promise<Client[]> {
  const res = await api.get(`/clients/`)
  return res.data
}

export async function getClientById(id: string): Promise<Client> {
  const res = await api.get(`/clients/${id}/`)
  return res.data
}

export async function createClient(client: Omit<Client, "id" | "created_at">): Promise<Client> {
  const res = await api.post(`/clients/`, client)
  return res.data
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  const res = await api.patch(`/clients/${id}/`, client)
  return res.data
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}/`)
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
