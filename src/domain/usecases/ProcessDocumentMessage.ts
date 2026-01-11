import TransactionRepository from "../../infra/database/repositories/TransactionRepository.js"
import { Transactions, TransactionsLLMType, TransactionsType, BaseTransaction } from "../entities/Transactions.js"
import { IAIClient, IFileClient } from "../interfaces/clients.js"
import { IUseCase } from "../interfaces/usecases.js"
import { csvParaObjetos } from "../../infra/helpers/csvHelper.js"
import { MimeTypeDocument } from "../enums/mimeTypeDocument.js"

class ProcessDocumentMessage implements IUseCase {
  private _aiInstance: IAIClient
  private _fileClient: IFileClient
  private _transactionsRepository: TransactionRepository

  constructor({
    aiClient,
    fileClient,
    transactionsRepository
  }: {
    aiClient: IAIClient
    fileClient: IFileClient
    transactionsRepository: TransactionRepository
  }) {
    this._aiInstance = aiClient
    this._fileClient = fileClient
    this._transactionsRepository = transactionsRepository
  }

  async execute({
    documentUrl,
    mimeType,
    chatId,
    caption,
    language
  }: {
    documentUrl: string
    mimeType: string
    chatId: number
    caption?: string | undefined
    language?: string | undefined
  }): Promise<TransactionsType> {
    const transactions =
      mimeType == MimeTypeDocument.APPLICATION_PDF
        ? await this.extractTransactionsFromDocumentUrl(documentUrl, caption, language)
        : mimeType == MimeTypeDocument.TEXT_CSV
          ? await this.extractTransactionsFromTextCSV(documentUrl)
          : []

    if (transactions.length === 0) {
      return []
    }

    const transactionsWithChatId = Transactions.parse(transactions.map((transaction) => ({ ...transaction, chatId })))

    await this.saveInDatabase([...transactionsWithChatId])

    return transactionsWithChatId
  }

  async extractTransactionsFromDocumentUrl(
    documentUrl: string,
    caption: string | undefined,
    language: string | undefined
  ): Promise<TransactionsLLMType> {
    const text = await this._aiInstance.extractTextFromPdfUrl(documentUrl)

    if (!text) {
      return []
    }

    const transactionsFromLLM = await this._aiInstance.informationExtractor({ text, caption, language })

    if (transactionsFromLLM.length === 0) {
      return []
    }

    return transactionsFromLLM
  }

  async extractTransactionsFromTextCSV(documentUrl: string): Promise<TransactionsLLMType> {
    const arquivo = await this._fileClient.downloadFile(documentUrl)

    const objetos = await csvParaObjetos(arquivo)

    if (objetos.length === 0) {
      return []
    }

    const transactionsFromCSV = objetos.map((obj) =>
      BaseTransaction.parse({
        description: `Corrida de Bolt / Moto Taxi de ${obj["from"]} para ${obj["to"]}`,
        date: obj["ride_start"],
        amount: {
          value: obj["total_price"],
          currency: obj["currency"]?.toUpperCase()
        }
      })
    )

    return transactionsFromCSV
  }

  async saveInDatabase(transactions: TransactionsType): Promise<void> {
    await this._transactionsRepository.insertMany(transactions)
  }
}

export default ProcessDocumentMessage
