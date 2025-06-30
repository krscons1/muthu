interface StoredClient {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  status: "active" | "inactive"
  createdAt: Date
}

export function getStoredClients(): StoredClient[] {
  if (typeof window === "undefined") return []

  const clients = JSON.parse(localStorage.getItem("clients") || "[]")
  return clients.map((client: any) => ({
    ...client,
    createdAt: new Date(client.createdAt),
  }))
}

export function getActiveClients(): StoredClient[] {
  return getStoredClients().filter((client) => client.status === "active")
}

export function getClientDisplayName(clientIdentifier: string): string {
  const clients = getStoredClients()
  const client = clients.find(
    (c) => c.company === clientIdentifier || c.name === clientIdentifier || c.id === clientIdentifier,
  )

  // Prefer company name over personal name for display
  return client ? client.company || client.name : clientIdentifier
}

export function getClientOptions(): string[] {
  return getActiveClients().map((client) => client.company || client.name)
}

export function findClientByIdentifier(identifier: string): StoredClient | null {
  const clients = getStoredClients()
  return clients.find((c) => c.company === identifier || c.name === identifier || c.id === identifier) || null
}

export function getClientFullDetails(identifier: string): {
  displayName: string
  email?: string
  phone?: string
  company?: string
  name: string
} | null {
  const client = findClientByIdentifier(identifier)
  if (!client) return null

  return {
    displayName: client.company || client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    name: client.name,
  }
}
