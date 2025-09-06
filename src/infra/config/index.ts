import "dotenv/config"

const config = {
  token: process.env.BOT_TOKEN || "",
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  database: {
    name: process.env.MONGO_DB_NAME || "",
    connectionString: process.env.MONGO_URL || ""
  },
  maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024 // 5MB
}

export default config
