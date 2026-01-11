import { TransactionsLLMType } from "../entities/Transactions.js"
import { Readable } from "stream"

export interface IAIClient {
  extractTextFromAudioUrl(audioUrl: string): Promise<string>
  extractTextFromImageUrl(imageUrl: string): Promise<string>
  extractTextFromPdfUrl(pdfUrl: string): Promise<string>
  informationExtractor({
    text,
    caption,
    language
  }: {
    text: string
    caption?: string | undefined
    language?: string | undefined
  }): Promise<TransactionsLLMType>
}

export interface IFileClient {
  downloadFile(fileUrl: string): Promise<Readable>
}
