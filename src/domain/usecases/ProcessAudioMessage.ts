import { Transactions, TransactionsType } from "../entities/Transactions.js"
import { IAIClient } from "../interfaces/clients.js"
import { ITransactionRepository } from "../interfaces/repositories.js"
import { IUseCase } from "../interfaces/usecases.js"

class ProcessAudioMessage implements IUseCase {
  private _aiInstance: IAIClient
  private _transactionsRepository: ITransactionRepository
  constructor({ aiClient, transactionsRepository }: { aiClient: IAIClient; transactionsRepository: ITransactionRepository }) {
    this._aiInstance = aiClient
    this._transactionsRepository = transactionsRepository
  }

  async execute({
    audioUrl,
    chatId,
    language
  }: {
    audioUrl: string
    chatId: number
    language?: string | undefined
  }): Promise<TransactionsType> {
    const text = await this._aiInstance.extractTextFromAudioUrl(audioUrl)

    if (!text) {
      return []
    }

    const transactionsFromLLM = await this._aiInstance.informationExtractor({ text, language })

    if (transactionsFromLLM.length === 0) {
      return []
    }

    const transactionsWithChatId = Transactions.parse(
      transactionsFromLLM.map((transaction) => ({ ...transaction, chatId }))
    )

    await this.saveInDatabase(transactionsWithChatId)

    return transactionsWithChatId
  }

  private async saveInDatabase(transactions: TransactionsType): Promise<void> {
    await this._transactionsRepository.insertMany(transactions)
  }
}

export default ProcessAudioMessage
