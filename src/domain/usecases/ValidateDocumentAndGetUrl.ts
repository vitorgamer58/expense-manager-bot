import { Telegraf } from "telegraf"
import { IUseCase } from "../interfaces/index.js"
import config from "../../infra/config/index.js"
import { ValidateDocument } from "../enums/validateDocument.js"

class ValidateDocumentAndGetUrl implements IUseCase {
  botInstance: Telegraf
  constructor({ botInstance }: { botInstance: Telegraf }) {
    this.botInstance = botInstance
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

    const fileUrl = (await this.botInstance.telegram.getFileLink(fileId)).href

    return { type: ValidateDocument.DOCUMENT_VALIDATED, fileUrl }
  }

  _isValidFileSize(fileSize: number): boolean {
    return fileSize <= config.maxFileSize
  }

  _isValidFileType(fileType: string): boolean {
    const validFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    return validFileTypes.includes(fileType)
  }
}

export default ValidateDocumentAndGetUrl
