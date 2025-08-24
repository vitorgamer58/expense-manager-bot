import { Telegraf } from "telegraf"
import config from "../config"
import ProcessTextMessage from "../../domain/usecases/ProcessTextMessage"

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.command("ping", async (ctx) => {
    await ctx.reply("pong")
  })

  bot.on("message", async (ctx) => {
    try {
      if (ctx.text === undefined) {
        await ctx.reply("Apenas mensagens de texto são suportadas")
        return
      }

      const instance = new ProcessTextMessage()

      const response = await instance.execute({ text: ctx.text, chatId: ctx.chat.id })
      await ctx.reply(response)
    } catch (error) {
      console.error("Error on message", error)
      await ctx.reply("Erro ao processar mensagem")
    }
  })

  bot.launch()
  console.log("🤖 Bot working \n")
}

export default runBot
