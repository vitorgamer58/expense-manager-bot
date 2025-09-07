import { ITransactionRepository } from "../interfaces/repositories.js"
import { IUseCase } from "../interfaces/usecases.js"

class GetExpenseReport implements IUseCase {
  private _transactionsRepository: ITransactionRepository
  constructor({ transactionsRepository }: { transactionsRepository: ITransactionRepository }) {
    this._transactionsRepository = transactionsRepository
  }

  async execute(chatId: number): Promise<string> {
    const expensesByCurrency = await this._transactionsRepository.getSumExpensesByCurrency(chatId)

    if (expensesByCurrency.length === 0) {
      return "Nenhuma despesa encontrada."
    }

    return expensesByCurrency
      .map((expense) => `Total de despesas em ${expense.currency}: ${expense.totalExpense.toFixed(2)}`)
      .join("\n")
  }
}

export default GetExpenseReport
