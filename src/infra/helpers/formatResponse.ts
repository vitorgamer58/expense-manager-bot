import { TransactionsType } from "../../domain/entities/Transactions.js"
import { formatDateToDDMMYYYY } from "./dateHelper.js"

export const formatResponse = (transactions: TransactionsType) => {
  let markDownString = "*Transactions*\n\n"
  transactions.forEach((transaction, index) => {
    if (index > 0) markDownString += `\n`
    markDownString += `Description: ${transaction.description}\n`
    markDownString += `Date: ${formatDateToDDMMYYYY(transaction.date)}\n`
    markDownString += `Currency: ${transaction.amount.currency}\n`
    markDownString += `Value: ${transaction.amount.value}\n`

    if (Array.isArray(transaction.itens) && transaction.itens.length > 0) {
      markDownString += `Itens: ` + transaction.itens.join(",")
      markDownString += `\n`
    }
  })

  return markDownString
}
