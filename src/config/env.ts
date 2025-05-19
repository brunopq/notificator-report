import { cleanEnv, str } from "envalid"

export const env = cleanEnv(process.env, {
  API_BASE_URL: str({
    default: "https://api-notificador.ibotiadvogados.com.br",
  }),
})
