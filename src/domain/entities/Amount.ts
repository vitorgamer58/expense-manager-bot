import { z } from "zod"

const Amount = z.object({
  currency: z.string({ description: "Currency in format ISO 4217, example: (PYG, BRL, USD)" }),
  value: z.number({
    description:
      "The amount value, (negative if is a expense, if it is a commercial/service invoice, consider it an expense.)"
  })
})

export { Amount }
