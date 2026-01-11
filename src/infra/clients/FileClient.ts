import { Readable } from "stream"
import { IFileClient } from "../../domain/interfaces/clients.js"
import axios from "axios"

class FileClient implements IFileClient {
  async downloadFile(fileUrl: string): Promise<Readable> {
    return await axios.get<Readable>(fileUrl, { responseType: "stream" }).then((response) => response.data)
  }
}

export default FileClient
