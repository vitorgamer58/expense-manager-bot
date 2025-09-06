import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import config from "../config/index.js"
import ProcessTextMessage from "../../domain/usecases/ProcessTextMessage.js"
import ProcessImageMessage from "../../domain/usecases/ProcessImageMessage.js"
import ProcessAudioMessage from "../../domain/usecases/ProcessAudioMessage.js"
import GetExpenseReport from "../../domain/usecases/GetExpenseReport.js"
import rateLimit from "./middlewares/rateLimit.js"

import TransactionRepository from "../database/repositories/TransactionRepository.js"
import AI from "../clients/AI.js"
import ProcessDocumentMessage from "../../domain/usecases/ProcessDocumentMessage.js"
import { formatResponse } from "../helpers/formatResponse.js"
import ValidateDocumentAndGetUrl from "../../domain/usecases/ValidateDocumentAndGetUrl.js"
import { ValidateDocument } from "../../domain/enums/validateDocument.js"

const aiClient = new AI()
const transactionsRepository = new TransactionRepository()

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.use(rateLimit())

  bot.command("ping", async (ctx) => {
    await ctx.reply("pong")
  })

  bot.command("resumo", async (ctx) => {
    try {
      const instance = new GetExpenseReport({ transactionsRepository })

      const response = await instance.execute(ctx.chat.id)
      await ctx.reply(response)
    } catch (error) {
      console.error("Error on resumo", error)
      await ctx.reply("Erro ao buscar resumo")
    }
  })

  bot.on(message("text"), async (ctx) => {
    try {
      if (ctx.message.text === undefined) {
        await ctx.reply("Apenas mensagens de texto são suportadas")
        return
      }

      const instance = new ProcessTextMessage({ aiClient, transactionsRepository })

      const result = await instance.execute({
        text: ctx.message.text,
        chatId: ctx.chat.id,
        language: ctx.from?.language_code
      })

      const response = formatResponse(result)

      await ctx.reply(response, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("Error on message", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.on(message("photo"), async (ctx) => {
    try {
      const imageId = ctx.message.photo[ctx.message.photo.length - 1]?.file_id
      const caption = ctx.message.caption

      if (imageId === undefined) {
        await ctx.reply("Ocorreu um erro ao processar a imagem")
        return
      }

      const imageUrl = (await bot.telegram.getFileLink(imageId)).toString()

      const instance = new ProcessImageMessage({ aiClient, transactionsRepository })

      const result = await instance.execute({
        imageUrl,
        chatId: ctx.chat.id,
        caption,
        language: ctx.from?.language_code
      })

      const response = formatResponse(result)

      await ctx.reply(response, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("Error on photo", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.on(message("document"), async (ctx) => {
    try {
      const fileId = ctx.message.document?.file_id
      const caption = ctx.message.caption
      const fileType = ctx.message.document.mime_type || ""

      if (fileId === undefined || ctx.message.document.file_size === undefined) {
        await ctx.reply("Ocorreu um erro ao processar o documento")
        return
      }

      const validateDocumentAndGetUrl = new ValidateDocumentAndGetUrl({
        botInstance: bot
      })

      const { type, fileUrl } = await validateDocumentAndGetUrl.execute({
        fileId,
        fileSize: ctx.message.document.file_size,
        fileType: ctx.message.document.mime_type || ""
      })
      
      switch (type) {
        case ValidateDocument.DOCUMENT_TOO_LARGE:
          await ctx.reply("O documento é muito grande. O tamanho máximo é 5MB.")
          return
        case ValidateDocument.DOCUMENT_INVALID_TYPE:
          await ctx.reply("Tipo de documento não suportado. Envie uma imagem ou PDF.")
          return
        case ValidateDocument.DOCUMENT_VALIDATED:
          break
        default:
          await ctx.reply("Ocorreu um erro ao processar o documento")
          return
      }

      let instance

      if (fileType.startsWith("image/")) {
        instance = new ProcessImageMessage({ aiClient, transactionsRepository })
      } else if (fileType === "application/pdf") {
        instance = new ProcessDocumentMessage({ aiClient, transactionsRepository })
      } else {
        await ctx.reply("Tipo de documento não suportado. Envie uma imagem ou PDF.")
        return
      }

      const result = await instance.execute({
        imageUrl: fileUrl!,
        documentUrl: fileUrl!,
        chatId: ctx.chat.id,
        caption,
        language: ctx.from?.language_code
      })

      const response = formatResponse(result)

      await ctx.reply(response, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("Error on document", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.on(message("voice"), async (ctx) => {
    try {
      const fileId = ctx.message.voice?.file_id

      if (fileId === undefined) {
        await ctx.reply("Ocorreu um erro ao processar a imagem")
        return
      }

      const fileUrl = (await bot.telegram.getFileLink(fileId)).toString()

      const instance = new ProcessAudioMessage({ aiClient, transactionsRepository })

      const result = await instance.execute({ audioUrl: fileUrl, chatId: ctx.chat.id })

      const response = formatResponse(result)

      await ctx.reply(response, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("Error on audio", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.launch()
  console.log("🤖 Bot working \n")
}

export default runBot
