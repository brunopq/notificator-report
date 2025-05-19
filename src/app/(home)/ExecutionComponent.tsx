"use client"

import { AlertTriangle, Clock, RefreshCcw, Send } from "lucide-react"
import { type JSX, type ReactNode, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useInView } from "react-intersection-observer"

import ClientService from "@/services/ClientService"
import type {
  Execution,
  NotificationError,
  NotificationStatus,
  Snapshot,
} from "@/services/ExecutionService"
import MovimentationService from "@/services/MovimentationService"

type ExecutionComponentProps = {
  execution: Execution
}
export type KeyOfType<T, KType> = {
  [K in keyof T]: T[K] extends KType ? K : never
}[keyof T]

function countBy<T>(
  list: T[],
  key: KeyOfType<T, string>,
): Partial<Record<string, number>> {
  const counters: Partial<Record<string, number>> = {}

  for (const el of list) {
    const k = el[key] as string
    counters[k] = (counters[k] ?? 0) + 1
  }

  return counters
}

const statusLabelMap: Record<NotificationStatus, string> = {
  ERROR: "Erro fatal",
  NOT_SENT: "Não enviado",
  SCHEDULED: "Agendado",
  SENT: "Enviado",
  WILL_RETRY: "Erro",
}

const errorLabelMap: Record<NotificationError, string> = {
  INVALID_PHONE: "Número de telefone inválido",
  NO_PHONE_NUMBER: "Cliente sem número de telefone",
  PHONE_NOT_ON_WHATSAPP: "Telefone não está no Whatsapp",
  UNKNOWN_ERROR: "Erro desconhecido",
}

export function ExecutionComponent({ execution }: ExecutionComponentProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/25 p-2 shadow-md">
      <button
        className="w-full"
        type="button"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="text-start ">
          <h2 className="w-fit font-semibold text-lg text-zinc-50">
            Execução{" "}
            {format(new Date(execution.createdAt), "dd 'de' MMMM 'às' HH:mm", {
              locale: ptBR,
            })}
          </h2>

          <ExecutionSummary execution={execution} />
        </div>
      </button>

      {expanded && <ExecutionDetails execution={execution} />}
    </div>
  )
}

function ExecutionSummary({ execution }: ExecutionComponentProps) {
  const { SENT, ERROR, WILL_RETRY } = countBy(
    execution.notificationSnapshots,
    "status",
  )

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <span>
        {execution.notificationSnapshots.length} notificaç
        {execution.notificationSnapshots.length === 1 ? "ão" : "ões"}
      </span>

      <span className="text-green-300">{SENT || 0} enviadas</span>
      <span className="text-red-300">{ERROR || 0} falharam</span>
      <span className="text-orange-300">{WILL_RETRY || 0} erro temporário</span>
    </div>
  )
}

function ExecutionDetails({ execution }: ExecutionComponentProps) {
  return (
    <div className="mt-4 space-y-2">
      {execution.notificationSnapshots.map((snap) => (
        <SnapshotComponent key={snap.id} snapshot={snap} />
      ))}
    </div>
  )
}

type SnapshotComponentProps = {
  snapshot: Snapshot
}

function SnapshotComponent({ snapshot }: SnapshotComponentProps) {
  const { ref, inView } = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      key={snapshot.id}
      className="grid grid-cols-2 items-center justify-between rounded-lg bg-zinc-800/25 p-2"
    >
      <div>
        <ClientName
          visible={inView}
          clientId={snapshot.notification.clientId}
        />
        <p className="line-clamp-2 text-zinc-300">
          <strong>Mensagem:</strong> {snapshot.notification.message}
        </p>
        <MovimentationInfo
          visible={inView}
          movimentationId={snapshot.notification.movimentationId}
        />
      </div>

      <div className="flex flex-col items-end space-y-1">
        <StatusBadge status={snapshot.status} />
        {snapshot.error && (
          <span className="text-red-400 text-xs">
            {errorLabelMap[snapshot.error]}
          </span>
        )}
      </div>
    </div>
  )
}

function MovimentationInfo({
  movimentationId,
  visible,
}: { movimentationId: string; visible: boolean }) {
  const { data, status } = useQuery({
    queryKey: ["lawsuit", movimentationId],
    queryFn: () => MovimentationService.getById(movimentationId),
    enabled: visible,
  })

  let cnj: ReactNode
  if (status === "pending") {
    cnj = "Buscando..."
  }

  if (data?.lawsuit.cnj) {
    cnj = data.lawsuit.cnj
  }

  if (status === "error") {
    cnj = <span className="text-red-300">CNJ não encontrado</span>
  }

  return (
    <p className="text-zinc-300">
      <strong>Processo:</strong> {cnj}
    </p>
  )
}

function ClientName({
  clientId,
  visible,
}: { clientId: string; visible: boolean }) {
  const { data, status } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => ClientService.getById(clientId),
    enabled: visible,
  })

  let clientName: ReactNode
  if (status === "pending") {
    clientName = "Buscando..."
  }

  if (data?.name) {
    clientName = data.name
  }

  if (status === "error") {
    clientName = <span className="text-red-300">Cliente não encontrado</span>
  }

  return (
    <p className="text-zinc-300">
      <strong>Cliente:</strong> {clientName}
    </p>
  )
}

function StatusBadge({ status }: { status: NotificationStatus }) {
  const baseClass =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"

  const styles: Record<NotificationStatus, string> = {
    SENT: `${baseClass} bg-green-700 text-white`,
    ERROR: `${baseClass} bg-red-600 text-white`,
    NOT_SENT: `${baseClass} bg-zinc-700 text-zinc-300`,
    WILL_RETRY: `${baseClass} bg-yellow-600 text-white`,
    SCHEDULED: `${baseClass} bg-blue-600 text-white`,
  }

  const icons: Record<NotificationStatus, JSX.Element> = {
    SENT: <Send size={14} />,
    ERROR: <AlertTriangle size={14} />,
    NOT_SENT: <Clock size={14} />,
    WILL_RETRY: <RefreshCcw size={14} />,
    SCHEDULED: <Clock size={14} />,
  }

  return (
    <span className={styles[status] ?? baseClass}>
      {icons[status]} {statusLabelMap[status]}
    </span>
  )
}
