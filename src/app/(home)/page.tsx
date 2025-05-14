"use client"

import { useQuery } from "@tanstack/react-query"

import ExecutionService from "@/services/ExecutionService"

import { ExecutionComponent } from "./ExecutionComponent"

export default function Home() {
  return (
    <div className="mx-auto mt-8 max-w-6xl p-4">
      <header>
        <h1 className="text-xl">Relatório de notificações</h1>

        <label htmlFor="">
          <span>Dia: </span>
          <input className="rounded-sm border-2 border-zinc-950" type="date" />
        </label>
      </header>

      <main className="space-y-4">
        <ExecutionsList />
      </main>
    </div>
  )
}

function ExecutionsList() {
  const { data, isError, isLoading } = useQuery({
    queryKey: [],
    queryFn: () => ExecutionService.list(),
  })

  if (isLoading) {
    return "Carregando dados..."
  }

  if (isError || !data) {
    return "Erro ao buscar os dados :("
  }

  return data.map((e) => <ExecutionComponent key={e.id} execution={e} />)
}
