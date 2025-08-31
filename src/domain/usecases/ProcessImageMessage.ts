import AI from "../../infra/clients/AI.js"
import TransactionRepository from "../../infra/database/repositories/TransactionRepository.js"
import { Transactions, TransactionsType } from "../entities/Transactions.js"
import { IUseCase } from "../interfaces/index.js"

class ProcessImageMessage implements IUseCase {
  aiInstance: AI
  transactionsRepository: TransactionRepository
  constructor({ aiClient, transactionsRepository }: { aiClient: AI; transactionsRepository: TransactionRepository }) {
    this.aiInstance = aiClient
    this.transactionsRepository = transactionsRepository
  }

  async execute({
    imageUrl,
    chatId,
    caption,
    language
  }: {
    imageUrl: string
    chatId: number
    caption?: string | undefined
    language?: string | undefined
  }): Promise<TransactionsType> {
    const text = await this.aiInstance.extractTextFromImageUrl(imageUrl)

    if (!text) {
      return []
    }

    const transactionsFromLLM = await this.aiInstance.informationExtractor({ text, caption, language })

    if (transactionsFromLLM.length === 0) {
      return []
    }

    const transactionsWithChatId = Transactions.parse(
      transactionsFromLLM.map((transaction) => ({ ...transaction, chatId }))
    )

    await this.saveInDatabase([...transactionsWithChatId])

    return transactionsWithChatId
  }

  async saveInDatabase(transactions: TransactionsType): Promise<void> {
    await this.transactionsRepository.insertMany(transactions)
  }
}

export default ProcessImageMessage
