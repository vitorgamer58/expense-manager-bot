import { z } from "zod"

const User = z.object({
  id: z.string().optional(),
  chatId: z.number(),
  username: z.string().optional(),
  name: z.string().optional(),
  languageCode: z.string().optional(),
  createdAt: z.date().default(new Date())
})

export { User }
export type UserType = z.infer<typeof User>
