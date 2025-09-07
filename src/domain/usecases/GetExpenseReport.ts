import { formatDateToDDMMYYYY } from "../../infra/helpers/dateHelper.js"
import { TransactionsType } from "../entities/Transactions.js"
import { ITransactionRepository } from "../interfaces/repositories.js"
import { IUseCase } from "../interfaces/usecases.js"
import ExcelJS from "exceljs"

class GetExpenseReport implements IUseCase {
  private _transactionsRepository: ITransactionRepository
  constructor({ transactionsRepository }: { transactionsRepository: ITransactionRepository }) {
    this._transactionsRepository = transactionsRepository
  }

  async execute(chatId: number): Promise<Buffer> {
    const allTransactions = await this._getAllTransations(chatId)

    const spreadSheet = await this._createSpreadsheet(allTransactions)

    const spreadSheetBuffer = await this._getBufferFromSpreadSheet(spreadSheet)

    return Buffer.from(spreadSheetBuffer)
  }

  private async _getAllTransations(chatId: number) {
    return this._transactionsRepository.getAllByChatId(chatId)
  }

  private async _createSpreadsheet(transactions: TransactionsType) {
    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet("Relatório")

    worksheet.columns = [
      { header: "Data", key: "date", style: { numFmt: "dd/mm/yyyy" } },
      { header: "Descrição", key: "description" },
      { header: "Valor", key: "value" },
      { header: "Moeda", key: "currency" },
      { header: "Itens", key: "itens" }
    ]

    transactions.forEach((transaction) => {
      worksheet.addRow({
        ...transaction,
        date: formatDateToDDMMYYYY(transaction.date),
        value: transaction.amount.value,
        currency: transaction.amount.currency,
        itens: transaction.itens?.join(",")
      })
    })

    return workbook
  }

  private async _getBufferFromSpreadSheet(workbook: ExcelJS.Workbook) {
    return await workbook.xlsx.writeBuffer()
  }
}

export default GetExpenseReport
