import UserRepository from "../../infra/database/repositories/UserRepository.js"
import { UserType } from "../entities/User.js"
import { IUseCase } from "../interfaces/index.js"

class RegisterUser implements IUseCase {
  userRepository: UserRepository
  constructor({ userRepository }: { userRepository: UserRepository }) {
    this.userRepository = userRepository
  }

  async execute({ user }: { user: UserType }): Promise<void> {
    return await this.insertUserInDatabase(user)
  }

  async insertUserInDatabase(user: UserType): Promise<void> {
    await this.userRepository.insertOne(user)
  }
}

export default RegisterUser
