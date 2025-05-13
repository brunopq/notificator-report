import { z } from "zod"

import { env } from "@/config/env"

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phones: z.array(z.string()),
})

export type Client = z.infer<typeof clientSchema>

interface IClientService {
  getById(id: string): Promise<Client | undefined>
}

class MemoryClientService implements IClientService {
  private clients: Client[] = [
    {
      id: "client_001",
      name: "cliente roberto",
      phones: ["51980230041"],
    },
    {
      id: "client_002",
      name: "cliente edinaldo",
      phones: ["51980230220"],
    },
    {
      id: "client_003",
      name: "cliente pablo",
      phones: ["51980230116"],
    },
  ]

  async getById(id: string): Promise<Client | undefined> {
    return new Promise((res) =>
      setTimeout(() => res(this.clients.find((c) => c.id === id)), 1000),
    )
  }
}

class ClientService implements IClientService {
  async getById(id: string): Promise<Client | undefined> {
    const res = await fetch(`${env.API_BASE_URL}/clients/${id}`)

    if (res.status !== 200) {
      throw new Error("Backend api error")
    }

    const data = await res.json()

    const parsed = clientSchema.parse(data)

    return parsed
  }
}

export default new ClientService()
