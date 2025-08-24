import { Collection, MongoClient } from "mongodb"
import { connection } from "../connection"
import { TransactionsType } from "../../../domain/entities/Transactions"

class TransactionRepository {
  client: MongoClient
  collection: Collection
  constructor() {
    this.client = connection

    this.collection = this.client
      .db("expense_manager")
      .collection("transactions")
  }

  async insertMany(transactions: TransactionsType) {
    await this.collection.insertMany(transactions)
  }
}
export default TransactionRepository
