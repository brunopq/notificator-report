import ExecutionService from "@/services/ExecutionService"

import { ExecutionComponent } from "./ExecutionComponent"

export default async function Home() {
  const executions = await ExecutionService.list()

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
        {executions.map((e) => (
          <ExecutionComponent key={e.id} execution={e} />
        ))}
      </main>
    </div>
  )
}
