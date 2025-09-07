import { Context, MiddlewareFn } from "telegraf"
import { User } from "../../../domain/entities/User.js"
import RegisterUser from "../../../domain/usecases/RegisterUser.js"
import UserRepository from "../../database/repositories/UserRepository.js"

const registerUser = ({ userRepository }: { userRepository: UserRepository }): MiddlewareFn<Context> => {
  return async (ctx, next) => {
    try {
      const user = User.parse({
        chatId: ctx.message?.from?.id,
        username: ctx.message?.from?.username,
        name: ctx.message?.from?.first_name + (ctx.message?.from?.last_name ? ` ${ctx.message?.from?.last_name}` : ""),
        languageCode: ctx.message?.from?.language_code
      })

      const registerUser = new RegisterUser({ userRepository })

      await registerUser.execute({ user })

      return next()
    } catch (error) {
      console.error("Error in register user middleware:", error)
      await ctx.reply("Ocorreu um erro ao registrar o usuário. Por favor, tente novamente mais tarde.")
      return
    }
  }
}

export default registerUser
