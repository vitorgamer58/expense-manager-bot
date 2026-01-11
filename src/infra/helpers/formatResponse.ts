import { TransactionsType } from "../../domain/entities/Transactions.js"
import { formatDateToDDMMYYYY } from "./dateHelper.js"

export const formatResponse = (transactions: TransactionsType) => {
  let markDownString = "*Transactions*\n\n"
  const limit = Math.min(transactions.length, 6)

  for (let index = 0; index < limit; index++) {
    const transaction = transactions[index]!
    if (index > 0) markDownString += `\n`
    markDownString += `Description: ${transaction.description}\n`
    markDownString += `Date: ${formatDateToDDMMYYYY(transaction.date)}\n`
    markDownString += `Currency: ${transaction.amount.currency}\n`
    markDownString += `Value: ${transaction.amount.value}\n`

    if (Array.isArray(transaction.itens) && transaction.itens.length > 0) {
      markDownString += `Itens: ` + transaction.itens.join(",")
      markDownString += `\n`
    }
  }

  if (transactions.length > 6) {
    markDownString += `\n_E outros ${transactions.length - 6} lançamentos..._`
  }

  return markDownString
}
