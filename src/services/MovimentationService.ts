import { z } from "zod"

const lawsuitSchema = z.object({
  cnj: z.string(),
  judiceId: z.number(),
  id: z.string(),
  createdAt: z.date({ coerce: true }).nullable(),
  clientId: z.string(),
})

export type Lawsuit = z.infer<typeof lawsuitSchema>

const movimentationSchema = z.object({
  judiceId: z.number(),
  id: z.string(),
  createdAt: z.date({ coerce: true }).nullable(),
  lawsuitId: z.string(),
  type: z.enum(["AUDIENCIA", "PERICIA"]),
  expeditionDate: z.date({ coerce: true }).nullable(),
  finalDate: z.date({ coerce: true }).nullable(),
  isActive: z.boolean().nullable(),
})

const movimentationWithLawsuitSchema = movimentationSchema.extend({
  lawsuit: lawsuitSchema,
})

export type MovimentationWithLawsuit = z.infer<
  typeof movimentationWithLawsuitSchema
>

class MovimentationService {
  private lawsuits: Lawsuit[] = [
    {
      id: "lawsuit_001",
      cnj: "0001234-56.2025.8.21.0001",
      judiceId: 1001,
      createdAt: new Date("2025-01-15T09:30:00Z"),
      clientId: "client_001",
    },
    {
      id: "lawsuit_002",
      cnj: "0005678-90.2025.8.21.0002",
      judiceId: 1002,
      createdAt: new Date("2025-02-20T14:45:00Z"),
      clientId: "client_002",
    },
  ]

  private movimentations = [
    {
      id: "mov_001",
      judiceId: 1001,
      createdAt: new Date("2025-04-01T10:00:00Z"),
      lawsuitId: "lawsuit_001",
      type: "AUDIENCIA" as const,
      expeditionDate: new Date("2025-03-20T00:00:00Z"),
      finalDate: new Date("2025-04-10T00:00:00Z"),
      isActive: true,
    },
    {
      id: "mov_002",
      judiceId: 1002,
      createdAt: new Date("2025-04-02T11:00:00Z"),
      lawsuitId: "lawsuit_002",
      type: "PERICIA" as const,
      expeditionDate: null,
      finalDate: null,
      isActive: false,
    },
  ]

  async getById(movimentationId: string): Promise<MovimentationWithLawsuit> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mov = this.movimentations.find((m) => m.id === movimentationId)
        if (!mov) {
          return reject(new Error("Movimentation not found"))
        }

        const lawsuit = this.lawsuits.find((l) => l.id === mov.lawsuitId)
        if (!lawsuit) {
          return reject(new Error("Lawsuit not found for this movimentation"))
        }

        const result: MovimentationWithLawsuit = {
          ...mov,
          lawsuit,
        }

        resolve(result)
      }, 500)
    })
  }
}

export default new MovimentationService()
