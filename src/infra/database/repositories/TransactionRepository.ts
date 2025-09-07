import { Collection, MongoClient } from "mongodb"
import { connection } from "../connection.js"
import { Transaction, TransactionsType } from "../../../domain/entities/Transactions.js"
import config from "../../config/index.js"
import { ITransactionRepository } from "../../../domain/interfaces/repositories.js"

class TransactionRepository implements ITransactionRepository {
  client: MongoClient
  collection: Collection
  constructor() {
    this.client = connection

    this.collection = this.client.db(config.database.name).collection("transactions")
  }

  async getSumExpensesByCurrency(chatId: number) {
    const expensesByCurrencyAggregate = this.collection.aggregate([
      {
        $match: {
          chatId,
          "amount.value": { $lt: 0 }
        }
      },
      {
        $group: {
          _id: "$amount.currency",
          totalExpense: { $sum: "$amount.value" }
        }
      }
    ])

    const expensesByCurrency = await expensesByCurrencyAggregate.toArray()

    return expensesByCurrency.map((expense) => ({
      currency: expense._id,
      totalExpense: expense.totalExpense
    }))
  }

  async getAllByChatId(chatId: number): Promise<TransactionsType> {
    const documents = await this.collection.find({ chatId }).toArray()

    return documents.map((transaction) => {
      return Transaction.parse({ ...transaction })
    })
  }

  async insertMany(transactions: TransactionsType) {
    await this.collection.insertMany(transactions)
  }
}
export default TransactionRepository
