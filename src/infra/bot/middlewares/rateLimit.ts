import { Context, MiddlewareFn } from "telegraf"
import AuditRepository from "../../database/repositories/AuditRepository.js"
import { Audit } from "../../../domain/entities/Audit.js"

const auditRepository = new AuditRepository()

const rateLimit = (): MiddlewareFn<Context> => {
  return async (ctx, next) => {
    try {
      const chatId = ctx.chat?.id

      if (!chatId) return

      const dateYesterday = new Date()
      dateYesterday.setDate(dateYesterday.getDate() - 1)

      const timesUsedBot = await auditRepository.countAuditsByChatIdSinceDate(chatId, dateYesterday)

      if (timesUsedBot >= 15) {
        await ctx.reply(
          "Você atingiu o limite de uso do bot (15 mensagens por dia). Aguarde 24 horas para usar novamente."
        )
        return
      }

      const messageText = ctx.message && "text" in ctx.message ? (ctx.message as { text: string }).text : undefined

      const fileId =
        ctx.message && "photo" in ctx.message
          ? (ctx.message as { photo: { file_id: string }[] }).photo.pop()?.file_id
          : ctx.message && "document" in ctx.message
            ? (ctx.message as { document: { file_id: string } }).document.file_id
            : undefined

      const fileLink = fileId ? (await ctx.telegram.getFileLink(fileId)).toString() : undefined

      const audit = Audit.parse({ chatId, message: messageText, fileLink })

      await auditRepository.insertOne(audit)

      return next()
    } catch (error) {
      console.error("Error in rate limit middleware:", error)
      await ctx.reply("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.")
      return
    }
  }
}

export default rateLimit
