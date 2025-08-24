import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import config from "../config/index.js"
import ProcessTextMessage from "../../domain/usecases/ProcessTextMessage.js"
import ProcessImageMessage from "../../domain/usecases/ProcessImageMessage.js"
import ProcessAudioMessage from "../../domain/usecases/ProcessAudioMessage.js"
import GetExpenseReport from "../../domain/usecases/GetExpenseReport.js"

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.command("ping", async (ctx) => {
    await ctx.reply("pong")
  })

  bot.command("resumo", async (ctx) => {
    try {
      const instance = new GetExpenseReport()

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

      const instance = new ProcessTextMessage()

      const response = await instance.execute({ text: ctx.message.text, chatId: ctx.chat.id })
      await ctx.reply(response)
    } catch (error) {
      console.error("Error on message", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.on(message("photo"), async (ctx) => {
    try {
      const imageId = ctx.message.photo[ctx.message.photo.length - 1]?.file_id

      if (imageId === undefined) {
        await ctx.reply("Ocorreu um erro ao processar a imagem")
        return
      }

      const imageUrl = (await bot.telegram.getFileLink(imageId)).toString()

      const instance = new ProcessImageMessage()

      const response = await instance.execute({ imageUrl, chatId: ctx.chat.id })
      await ctx.reply(response)
    } catch (error) {
      console.error("Error on photo", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.on(message("document"), async (ctx) => {
    try {
      const fileId = ctx.message.document?.file_id

      if (fileId === undefined) {
        await ctx.reply("Ocorreu um erro ao processar a imagem")
        return
      }

      const imageUrl = (await bot.telegram.getFileLink(fileId)).toString()

      const instance = new ProcessImageMessage()

      const response = await instance.execute({ imageUrl, chatId: ctx.chat.id })
      await ctx.reply(response)
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

      const instance = new ProcessAudioMessage()

      const response = await instance.execute({ audioUrl: fileUrl, chatId: ctx.chat.id })
      await ctx.reply(response)
    } catch (error) {
      console.error("Error on audio", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.launch()
  console.log("🤖 Bot working \n")
}

export default runBot
