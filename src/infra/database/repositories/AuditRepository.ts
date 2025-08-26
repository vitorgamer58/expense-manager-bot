import { Collection, MongoClient } from "mongodb"
import { connection } from "../connection.js"
import { AuditType } from "../../../domain/entities/Audit.js"

class AuditRepository {
  client: MongoClient
  collection: Collection
  constructor() {
    this.client = connection

    this.collection = this.client.db("expense_manager").collection("audits")
  }

  async countAuditsByChatIdSinceDate(chatId: number, date: Date) {
    return await this.collection.countDocuments({ chatId, createdAt: { $gte: date } })
  }

  async insertOne(audit: AuditType) {
    await this.collection.insertOne(audit)
  }
}
export default AuditRepository
