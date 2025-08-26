import { z } from "zod"
import { Amount } from "./Amount.js"

const BaseTransaction = z.object({
  description: z
    .string({
      description: "String description of what this refers to, try include a summary of the type of items purchased."
    })
    .optional(),
  amount: Amount,
  date: z
    .string({ description: "The date the transaction was made, in ISO 8601 format (YYYY-MM-DD), Leave blank if none" })
    .optional(),
  itens: z.array(z.string()).optional()
})

const Transaction = BaseTransaction.extend({
  id: z.string().optional(),
  chatId: z.number(),
  date: z.preprocess((arg) => {
    if (arg == "") return new Date()
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
  }, z.date())
})

const TransactionsLLM = z.array(BaseTransaction)
const Transactions = z.array(Transaction)

export { TransactionsLLM, BaseTransaction, Transaction, Transactions }
export type TransactionsLLMType = z.infer<typeof TransactionsLLM>
export type TransactionsType = z.infer<typeof Transactions>
