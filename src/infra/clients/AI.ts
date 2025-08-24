import { Mistral } from "@mistralai/mistralai"
import config from "../config"
import {
  TransactionsLLM,
  TransactionsLLMType
} from "../../domain/entities/transactions"

class AI {
  client: Mistral
  constructor() {
    this.client = new Mistral({ apiKey: config.mistralApiKey })
  }

  async informationExtractor(text: string): Promise<TransactionsLLMType> {
    const chatResponse = await this.client.chat.parse({
      model: "ministral-3b-2410",
      messages: [
        {
          role: "system",
          content: `You are an expert extraction algorithm.
          First check if the message is information related to financial transactions. If it does not refer to a transaction or invoice, return an empty message.
          Extract only the relevant information about financial transactions from the user's message`
        },
        {
          role: "user",
          content: text
        }
      ],
      responseFormat: TransactionsLLM,
      maxTokens: 400,
      temperature: 0
    })

    return TransactionsLLM.parse(chatResponse?.choices?.[0]?.message?.parsed)
  }
}

export default AI
