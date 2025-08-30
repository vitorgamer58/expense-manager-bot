import { MongoClient } from "mongodb"
import config from "../config/index.js"

const mongoClient = new MongoClient(config.database.connectionString)

async function run() {
  await mongoClient.connect()

  await mongoClient.db("admin").command({ ping: 1 })
  console.log("Successfully connected to MongoDB!")
}
run().catch(console.dir)

export const connection = mongoClient
