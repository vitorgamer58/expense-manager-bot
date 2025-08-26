import { z } from "zod"

const Audit = z.object({
  chatId: z.number(),
  message: z.string().optional(),
  fileLink: z.string().optional(),
  createdAt: z.date().default(new Date())
})

export { Audit }
export type AuditType = z.infer<typeof Audit>
