import "dotenv/config"

const config = {
  token: process.env.BOT_TOKEN || "",
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  mongoConnectionString: process.env.MONGO_URL || ""
}

export default config
