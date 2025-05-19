"use client"

import { RotateCcwIcon } from "lucide-react"
import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { format } from "date-fns"

import ExecutionService, {
  type NotificationStatus,
  type Execution,
} from "@/services/ExecutionService"

import { ExecutionComponent } from "./ExecutionComponent"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multiselect"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const notificationStatusOptions = [
  { value: "NOT_SENT", label: "Não enviado" },
  { value: "SENT", label: "Enviado" },
  { value: "WILL_RETRY", label: "Erro de envio" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "ERROR", label: "Erro fatal" },
]

export default function Home() {
  const [date, setDate] = useState(new Date())
  const [notificationStatuses, setNotificationStatuses] = useState<
    NotificationStatus[]
  >([])

  const queryResult = useQuery({
    queryKey: [date, notificationStatuses],
    queryFn: () => ExecutionService.list({ day: date, notificationStatuses }),
  })
  const { refetch } = queryResult

  const handleRefetch = async () => {
    const { status } = await refetch()

    if (status === "success") {
      console.log("hellyaeh")
      toast.success("Dados atualizados!")
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-6xl p-4">
      <header>
        <h1 className="mb-6 text-center font-semibold text-3xl text-zinc-700">
          Relatório de notificações
        </h1>

        <div className="flex items-center justify-between gap-6">
          <fieldset className="flex flex-wrap items-center gap-4">
            <label>
              <span>Dia: </span>
              <Input
                value={date ? format(date, "yyyy-MM-dd") : undefined}
                onChange={(e) =>
                  e.target.valueAsDate && setDate(e.target.valueAsDate)
                }
                type="date"
              />
            </label>

            <label>
              <span>Tipos de notificações: </span>
              <MultiSelect
                options={notificationStatusOptions}
                value={notificationStatuses}
                //@ts-expect-error too lazy to fix
                onValueChange={setNotificationStatuses}
              />
            </label>
          </fieldset>

          <Button onClick={handleRefetch} title="Atualizar" size="icon">
            <RotateCcwIcon />
          </Button>
        </div>
      </header>

      <hr className="mx-auto my-10 w-1/5 border-zinc-900" />

      <main className="space-y-4">
        <ExecutionsList {...queryResult} />
      </main>
    </div>
  )
}

function ExecutionsList({
  data,
  isLoading,
  isError,
  error,
}: UseQueryResult<Execution[]>) {
  if (isLoading) {
    return <div className="mx-auto w-fit">Carregando dados...</div>
  }

  if (isError || !data) {
    console.log(error)
    return (
      <div className="mx-auto w-fit text-red-400">
        Erro ao buscar os dados :(
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mx-auto w-fit">
        Nenhum dado encontrado para os filtros especificados
      </div>
    )
  }

  return data.map((e) => <ExecutionComponent key={e.id} execution={e} />)
}
