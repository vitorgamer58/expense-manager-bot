import { z } from "zod"
import { amount } from "./Amount.js"

const BaseTransaction = z.object({
  description: z.string({
    description: "String description of what this refers to, try include a summary of the type of items purchased."
  }),
  amount: amount,
  date: z.string()
})

const Transaction = BaseTransaction.extend({
  id: z.string().optional(),
  chatId: z.number(),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
  }, z.date())
})

const TransactionsLLM = z.array(BaseTransaction)
const Transactions = z.array(Transaction)

export { TransactionsLLM, BaseTransaction, Transaction, Transactions }
export type TransactionsLLMType = z.infer<typeof TransactionsLLM>
export type TransactionsType = z.infer<typeof Transactions>
