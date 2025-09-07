import { Collection, MongoClient } from "mongodb"
import { connection } from "../connection.js"
import config from "../../config/index.js"
import { UserType } from "../../../domain/entities/User.js"

class UserRepository {
  client: MongoClient
  collection: Collection
  constructor() {
    this.client = connection

    this.collection = this.client.db(config.database.name).collection("users")
  }

  async insertOne(user: UserType) {
    await this.collection.updateOne({ chatId: user.chatId }, { $setOnInsert: { ...user }, $set: {} }, { upsert: true })
  }
}
export default UserRepository
