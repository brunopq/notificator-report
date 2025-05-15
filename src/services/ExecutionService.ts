import { z } from "zod"

import { env } from "@/config/env"
import { format } from "date-fns"

const notificationStatus = [
  "NOT_SENT",
  "SENT",
  "WILL_RETRY",
  "SCHEDULED",
  "ERROR",
] as const

export type NotificationStatus = (typeof notificationStatus)[number]

const notificationStatusSchema = z.enum(notificationStatus)

const notificationErrors = [
  "NO_PHONE_NUMBER",
  "INVALID_PHONE",
  "PHONE_NOT_ON_WHATSAPP",
  "UNKNOWN_ERROR",
] as const

type NotificationError = (typeof notificationErrors)[number]

const notificationErrorsSchema = z.enum(notificationErrors)

const notificationSchema = z.object({
  id: z.string(),
  movimentationId: z.string(),
  clientId: z.string(),
  message: z.string(),
  sentAt: z.date({ coerce: true }).nullish(),
  scheduleArn: z.string().nullish(),
  // recieved: boolean().notNull(), // some day we might implement this
  status: notificationStatusSchema,
  error: notificationErrorsSchema.nullish(),
})

const notificationSnapshotSchema = z.object({
  id: z.string(),
  notificationId: z.string(),
  status: notificationStatusSchema,
  error: notificationErrorsSchema.nullish(),
  notification: notificationSchema,
})

export type Snapshot = z.infer<typeof notificationSnapshotSchema>

export const executionSchema = z.object({
  id: z.string(),
  createdAt: z.date({ coerce: true }),
  notificationSnapshots: z.array(notificationSnapshotSchema),
})

export const executionListSchema = z.array(executionSchema)

export type Execution = z.infer<typeof executionSchema>

export type ListExecutionOptions = {
  day: Date
  notificationStatuses?: NotificationStatus[]
}

interface IExecutionService {
  list(options: ListExecutionOptions): Promise<Execution[]>
}

class MemoryExecutionService implements IExecutionService {
  async list(): Promise<Execution[]> {
    return [
      {
        id: "exec_001",
        createdAt: new Date("2025-05-10T10:00:00Z"),
        notificationSnapshots: [
          {
            id: "snap_001",
            notificationId: "notif_001",
            status: "SENT",
            error: null,
            notification: {
              id: "notif_001",
              movimentationId: "mov_001",
              clientId: "client_001",
              message: "Seu processo teve uma nova movimentação.",
              sentAt: new Date("2025-05-10T10:05:00Z"),
              scheduleArn: "arn:aws:scheduler:::mock-arn-001",
              status: "SENT",
              error: null,
            },
          },
        ],
      },
      {
        id: "exec_002",
        createdAt: new Date("2025-05-11T14:30:00Z"),
        notificationSnapshots: [
          {
            id: "snap_002",
            notificationId: "notif_002",
            status: "ERROR",
            error: "NO_PHONE_NUMBER",
            notification: {
              id: "notif_002",
              movimentationId: "mov_002",
              clientId: "client_002",
              message: "Atualização no seu processo.",
              sentAt: null,
              status: "ERROR",
              error: "NO_PHONE_NUMBER",
            },
          },
          {
            id: "snap_003",
            notificationId: "notif_003",
            status: "SCHEDULED",
            error: null,
            notification: {
              id: "notif_003",
              movimentationId: "mov_003",
              clientId: "client_003",
              message: "Nova movimentação detectada.",
              sentAt: null,
              scheduleArn: "arn:aws:scheduler:::mock-arn-003",
              status: "SCHEDULED",
              error: null,
            },
          },
        ],
      },
      {
        id: "exec_003",
        createdAt: new Date("2025-05-12T08:45:00Z"),
        notificationSnapshots: [
          {
            id: "snap_004",
            notificationId: "notif_004",
            status: "WILL_RETRY",
            error: "UNKNOWN_ERROR",
            notification: {
              id: "notif_004",
              movimentationId: "mov_004",
              clientId: "client_004",
              message: "Tentando novamente em breve.",
              sentAt: null,
              status: "WILL_RETRY",
              error: "UNKNOWN_ERROR",
            },
          },
          {
            id: "snap_005",
            notificationId: "notif_005",
            status: "NOT_SENT",
            error: null,
            notification: {
              id: "notif_005",
              movimentationId: "mov_005",
              clientId: "client_005",
              message: "Seu processo foi atualizado.",
              sentAt: null,
              status: "NOT_SENT",
              error: null,
            },
          },
        ],
      },
    ]
  }
}

class ExecutionService implements IExecutionService {
  async list({
    day,
    notificationStatuses: selectedTypes,
  }: ListExecutionOptions): Promise<Execution[]> {
    const formatedDay = format(day, "yyyy-MM-dd")
    const formatedTypes = selectedTypes?.join(",")

    const res = await fetch(
      `${env.API_BASE_URL}/executions?day=${formatedDay}&notificationStatuses=${formatedTypes}`,
    )

    if (res.status !== 200) {
      throw new Error("Backend api error")
    }

    const data = await res.json()

    const parsed = executionListSchema.parse(data)

    return parsed
  }
}

export default new ExecutionService()
