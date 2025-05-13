import { z } from "zod"

import { env } from "@/config/env"

export const lawsuitSchema = z.object({
  id: z.string(),
  cnj: z.string(),
  clientId: z.string(),
  judiceId: z.number(),
})

export type Lawsuit = z.infer<typeof lawsuitSchema>

interface ILawsuitService {
  getById(id: string): Promise<Lawsuit | undefined>
}

class MemoryLawsuitService implements ILawsuitService {
  private lawsuits: Lawsuit[] = [
    { id: "1", cnj: "12345678901234567890", clientId: "client1", judiceId: 1 },
    { id: "2", cnj: "09876543210987654321", clientId: "client2", judiceId: 2 },
    { id: "3", cnj: "11223344556677889900", clientId: "client3", judiceId: 3 },
    { id: "4", cnj: "22334455667788990011", clientId: "client4", judiceId: 4 },
    { id: "5", cnj: "33445566778899001122", clientId: "client5", judiceId: 5 },
  ]

  async getById(id: string): Promise<Lawsuit | undefined> {
    return new Promise((res) =>
      setTimeout(() => res(this.lawsuits.find((c) => c.id === id)), 1000),
    )
  }
}

class LawsuitService implements ILawsuitService {
  async getById(id: string): Promise<Lawsuit | undefined> {
    const res = await fetch(`${env.API_BASE_URL}/lawsuits/${id}`)

    if (res.status !== 200) {
      throw new Error("Backend api error")
    }

    const data = await res.json()

    const parsed = lawsuitSchema.parse(data)

    return parsed
  }
}

export default new LawsuitService()
