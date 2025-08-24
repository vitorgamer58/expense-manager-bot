import AI from "../../infra/clients/AI"
import TransactionRepository from "../../infra/database/repositories/TransactionRepository"
import { Transactions, TransactionsType } from "../entities/transactions"
import { IUseCase } from "../interfaces"

class ProcessTextMessage implements IUseCase {
  aiInstance: AI
  transactionsRepository: TransactionRepository
  constructor() {
    this.aiInstance = new AI()
    this.transactionsRepository = new TransactionRepository()
  }

  async execute({
    text,
    chatId
  }: {
    text: string
    chatId: number
  }): Promise<string> {
    const transactionsFromLLM = await this.aiInstance.informationExtractor(text)

    const transactionsWithChatId = Transactions.parse(
      transactionsFromLLM.map((transaction) => ({ ...transaction, chatId }))
    )

    await this.saveInDatabase(transactionsWithChatId)

    return JSON.stringify(transactionsFromLLM)
  }

  async saveInDatabase(transactions: TransactionsType): Promise<void> {
    await this.transactionsRepository.insertMany(transactions)
  }
}

export default ProcessTextMessage
