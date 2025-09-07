import { AuditType } from "../entities/Audit.js";
import { TransactionsType } from "../entities/Transactions.js";
import { UserType } from "../entities/User.js";

export interface IAuditRepository {
	countAuditsByChatIdSinceDate(chatId: number, date: Date): Promise<number>
	insertOne(audit: AuditType): Promise<void>
}


export interface ITransactionRepository {
	getSumExpensesByCurrency(chatId: number): Promise<{ currency: string; totalExpense: number }[]>
	insertMany(transactions: TransactionsType): Promise<void>
}


export interface IUserRepository {
	insertOne(user: UserType): Promise<void>
}