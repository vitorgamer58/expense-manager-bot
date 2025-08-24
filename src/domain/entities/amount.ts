import { z } from "zod"

const amount = z.object({
  currency: z.string({ description: "Currency in format ISO 4217, example: (PYG, BRL, USD)" }),
  value: z
    .number({
      description:
        "The amount value, (negative if is a expense, if it is a commercial/service invoice, consider it an expense.)"
    })
    .refine((val) => val !== 0, { message: "Amount value cannot be zero" })
})

export { amount }
/*  and return it in a JSON array with the following format, If there are no transactions, return an empty array:
          [{description: String description of what this refers to, try include a summary of the type of items purchased., amount: {currency: string in format ISO 4217, example: (PYG, BRL, USD), value: number (negative if is a expense, if it is a commercial/service invoice, consider it an expense.)}, date: string}]. */
