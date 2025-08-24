import { Telegraf } from "telegraf"
import config from "./config"

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.command("ping", async (ctx) => {
    await ctx.reply("pong")
  })

  bot.launch()
  console.log("🤖 Bot working \n")
}

export default runBot
