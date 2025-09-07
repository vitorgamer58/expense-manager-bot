import { Telegraf } from "telegraf"
import { IUseCase } from "../interfaces/usecases.js"
import config from "../../infra/config/index.js"
import { ValidateDocument } from "../enums/validateDocument.js"

class ValidateDocumentAndGetUrl implements IUseCase {
  private _botInstance: Telegraf
  constructor({ botInstance }: { botInstance: Telegraf }) {
    this._botInstance = botInstance
  }

  async execute({
    fileId,
    fileSize,
    fileType
  }: {
    fileId: string
    fileSize: number
    fileType: string
  }): Promise<{ type: ValidateDocument; fileUrl?: string }> {
    if (this._isValidFileSize(fileSize) == false) return { type: ValidateDocument.DOCUMENT_TOO_LARGE }

    if (this._isValidFileType(fileType) == false) return { type: ValidateDocument.DOCUMENT_INVALID_TYPE }

    const fileUrl = (await this._botInstance.telegram.getFileLink(fileId)).href

    return { type: ValidateDocument.DOCUMENT_VALIDATED, fileUrl }
  }

  private _isValidFileSize(fileSize: number): boolean {
    return fileSize <= config.maxFileSize
  }

  private _isValidFileType(fileType: string): boolean {
    const validFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    return validFileTypes.includes(fileType)
  }
}

export default ValidateDocumentAndGetUrl
