import ExcelJS from "exceljs"
import { Readable } from "stream"

export const csvParaObjetos = async (arquivo: Readable): Promise<Record<string, string>[]> => {
  const workbook = new ExcelJS.Workbook()

  await workbook.csv.read(arquivo)

  const worksheet = workbook.worksheets[0]!

  const resultado: Record<string, string>[] = []
  let headers: string[] = []

  worksheet.eachRow((row, rowNumber) => {
    const values = row.values as Array<string>

    if (rowNumber === 1) {
      headers = values.slice(1)
      return
    }

    const obj: Record<string, string> = {}

    values.slice(1).forEach((value, index) => {
      obj[headers[index!]!] = value
    })

    resultado.push(obj)
  })

  return resultado
}
