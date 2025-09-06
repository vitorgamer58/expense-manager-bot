import { Mistral } from "@mistralai/mistralai"
import config from "../config/index.js"
import { TransactionsLLM, TransactionsLLMType } from "../../domain/entities/Transactions.js"

class AI {
  client: Mistral
  constructor() {
    this.client = new Mistral({ apiKey: config.mistralApiKey })
  }

  async extractTextFromAudioUrl(audioUrl: string): Promise<string> {
    try {
      const transcriptionResponse = await this.client.audio.transcriptions.complete({
        model: "voxtral-mini-latest",
        fileUrl: audioUrl
      })

      return transcriptionResponse.text
    } catch (error) {
      console.error("Error processing Audio:", error)
      throw error
    }
  }

  async extractTextFromImageUrl(imageUrl: string): Promise<string> {
    try {
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          imageUrl
        },
        includeImageBase64: true
      })
      return ocrResponse.pages?.map((page) => page.markdown || "").join("\n") || ""
    } catch (error) {
      console.error("Error processing OCR:", error)
      throw error
    }
  }

  async extractTextFromPdfUrl(pdfUrl: string): Promise<string> {
    try {
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: pdfUrl
        },
        includeImageBase64: true
      })
      return ocrResponse.pages?.map((page) => page.markdown || "").join("\n") || ""
    } catch (error) {
      console.error("Error processing OCR:", error)
      throw error
    }
  }

  async informationExtractor({
    text,
    caption,
    language
  }: {
    text: string
    caption?: string | undefined
    language?: string | undefined
  }): Promise<TransactionsLLMType> {
    const chatResponse = await this.client.chat.parse({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: `You are an expert extraction algorithm.
          First check if the message is information related to financial transactions. If it does not refer to a transaction or invoice, return an empty message.
          Extract only the relevant information about financial transactions from the user's message
          If you do not know the value of an attribute asked to extract, you may omit the attribute's value.
          Description: Is a description of what this refers to, try include a summary of the type of items purchased
          The amount is negative for expenses, if is a receipt or a bill, consider as a expense
          If the date is partial, consider the actual year: ${new Date().getFullYear()}
          If don't have date, consider the actual date: ${new Date().toISOString().split("T")[0]}
          ${language ? `The user speaks ${language}, so answer in ${language}` : "Answer in English"}`
        },
        {
          role: "user",
          content: text + (caption ? `\n\nContext: ${caption}` : "")
        }
      ],
      responseFormat: TransactionsLLM,
      maxTokens: 4024,
      temperature: 0
    })

    return TransactionsLLM.parse(chatResponse?.choices?.[0]?.message?.parsed)
  }
}

export default AI
