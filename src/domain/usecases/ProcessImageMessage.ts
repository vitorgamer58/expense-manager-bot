import { Transactions, TransactionsType } from "../entities/Transactions.js"
import { IAIClient } from "../interfaces/clients.js"
import { ITransactionRepository } from "../interfaces/repositories.js"
import { IUseCase } from "../interfaces/usecases.js"

class ProcessImageMessage implements IUseCase {
  private _aiInstance: IAIClient
  private _transactionsRepository: ITransactionRepository
  constructor({
    aiClient,
    transactionsRepository
  }: {
    aiClient: IAIClient
    transactionsRepository: ITransactionRepository
  }) {
    this._aiInstance = aiClient
    this._transactionsRepository = transactionsRepository
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
    const text = await this._aiInstance.extractTextFromImageUrl(imageUrl)

    if (!text) {
      return []
    }

    const transactionsFromLLM = await this._aiInstance.informationExtractor({ text, caption, language })

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
    await this._transactionsRepository.insertMany(transactions)
  }
}

export default ProcessImageMessage
