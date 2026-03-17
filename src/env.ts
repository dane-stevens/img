import "dotenv/config"
import { z } from "zod";

const ENV = z.object({
  ALLOWED_UPSTREAM_ORIGINS: z.string().transform(val => val.split(',')?.map(val => val.trim())),
  ALLOWED_CLIENT_ORIGINS: z.optional(z.string().transform(val => val.split(',')?.map(val => val.trim())))
})

export type ENV = z.infer<typeof ENV>
export const env = ENV.parse(process.env)