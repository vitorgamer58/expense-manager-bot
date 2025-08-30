import "dotenv/config"

const config = {
  token: process.env.BOT_TOKEN || "",
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  database: {
    name: process.env.MONGO_DB_NAME || "",
    connectionString: process.env.MONGO_URL || ""
  }
}

export default config
