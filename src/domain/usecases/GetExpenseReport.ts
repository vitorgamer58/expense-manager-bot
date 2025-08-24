import TransactionRepository from "../../infra/database/repositories/TransactionRepository"
import { IUseCase } from "../interfaces"

class GetExpenseReport implements IUseCase {
  transactionsRepository: TransactionRepository
  constructor() {
    this.transactionsRepository = new TransactionRepository()
  }

  async execute(chatId: number): Promise<string> {
    const expensesByCurrency = await this.transactionsRepository.getSumExpensesByCurrency(chatId)

    if (expensesByCurrency.length === 0) {
      return "Nenhuma despesa encontrada."
    }

    return expensesByCurrency
      .map((expense) => `Total de despesas em ${expense.currency}: ${expense.totalExpense.toFixed(2)}`)
      .join("\n")
  }
}

export default GetExpenseReport
