import AI from "../../infra/clients/AI.js"
import TransactionRepository from "../../infra/database/repositories/TransactionRepository.js"
import { Transactions, TransactionsType } from "../entities/Transactions.js"
import { IUseCase } from "../interfaces/index.js"

class ProcessAudioMessage implements IUseCase {
  aiInstance: AI
  transactionsRepository: TransactionRepository
  constructor({ aiClient, transactionsRepository }: { aiClient: AI; transactionsRepository: TransactionRepository }) {
    this.aiInstance = aiClient
    this.transactionsRepository = transactionsRepository
  }

  async execute({
    audioUrl,
    chatId,
    language
  }: {
    audioUrl: string
    chatId: number
    language?: string | undefined
  }): Promise<string> {
    const text = await this.aiInstance.extractTextFromAudioUrl(audioUrl)

    if (!text) {
      return "Não foi possível extrair texto do audio"
    }

    const transactionsFromLLM = await this.aiInstance.informationExtractor({ text, language })

    if (transactionsFromLLM.length === 0) {
      return "Nenhuma transação financeira encontrada no audio"
    }

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

export default ProcessAudioMessage
