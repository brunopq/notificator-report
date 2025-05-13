import { cleanEnv, str } from "envalid"

export const env = cleanEnv(process.env, {
  API_BASE_URL: str({ default: "http://localhost:8080" }),
})
