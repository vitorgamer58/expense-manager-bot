import { Collection, MongoClient } from "mongodb"
import { connection } from "../connection.js"
import { AuditType } from "../../../domain/entities/Audit.js"
import config from "../../config/index.js"
import { IAuditRepository } from "../../../domain/interfaces/repositories.js"

class AuditRepository implements IAuditRepository {
  client: MongoClient
  collection: Collection
  constructor() {
    this.client = connection

    this.collection = this.client.db(config.database.name).collection("audits")
  }

  async countAuditsByChatIdSinceDate(chatId: number, date: Date) {
    return await this.collection.countDocuments({ chatId, createdAt: { $gte: date } })
  }

  async insertOne(audit: AuditType) {
    await this.collection.insertOne(audit)
  }
}
export default AuditRepository
