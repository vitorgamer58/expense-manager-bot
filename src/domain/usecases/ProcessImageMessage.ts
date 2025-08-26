import AI from "../../infra/clients/AI.js"
import TransactionRepository from "../../infra/database/repositories/TransactionRepository.js"
import { Transactions, TransactionsType } from "../entities/Transactions.js"
import { IUseCase } from "../interfaces/index.js"

class ProcessImageMessage implements IUseCase {
  aiInstance: AI
  transactionsRepository: TransactionRepository
  constructor() {
    this.aiInstance = new AI()
    this.transactionsRepository = new TransactionRepository()
  }

  async execute({
    imageUrl,
    chatId,
    caption
  }: {
    imageUrl: string
    chatId: number
    caption: string | undefined | null
  }): Promise<string> {
    const text = await this.aiInstance.extractTextFromImageUrl(imageUrl)

    if (!text) {
      return "Não foi possível extrair texto da imagem"
    }

    const transactionsFromLLM = await this.aiInstance.informationExtractor(text, caption)

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

export default ProcessImageMessage
