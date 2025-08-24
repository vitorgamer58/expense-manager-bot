import AI from "../../infra/clients/AI"
import TransactionRepository from "../../infra/database/repositories/TransactionRepository"
import { Transactions, TransactionsType } from "../entities/Transactions"
import { IUseCase } from "../interfaces"

class ProcessImageMessage implements IUseCase {
  aiInstance: AI
  transactionsRepository: TransactionRepository
  constructor() {
    this.aiInstance = new AI()
    this.transactionsRepository = new TransactionRepository()
  }

  async execute({ imageUrl, chatId }: { imageUrl: string; chatId: number }): Promise<string> {
    const text = await this.aiInstance.extractTextFromImageUrl(imageUrl)

    if (!text) {
      return "Não foi possível extrair texto da imagem"
    }

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

export default ProcessImageMessage
