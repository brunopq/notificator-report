import { z } from "zod"

const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phones: z.array(z.string()),
})

export type Client = z.infer<typeof clientSchema>

class ClientService {
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

export default new ClientService()
