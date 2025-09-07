import { UserType } from "../entities/User.js"
import { IUserRepository } from "../interfaces/repositories.js"
import { IUseCase } from "../interfaces/usecases.js"

class RegisterUser implements IUseCase {
  private _userRepository: IUserRepository
  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this._userRepository = userRepository
  }

  async execute({ user }: { user: UserType }): Promise<void> {
    return await this.insertUserInDatabase(user)
  }

  private async insertUserInDatabase(user: UserType): Promise<void> {
    await this._userRepository.insertOne(user)
  }
}

export default RegisterUser
