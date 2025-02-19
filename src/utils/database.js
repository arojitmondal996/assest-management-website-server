const dotenv = require("dotenv");
const process = require("process");
const { MongoClient } = require("mongodb");

dotenv.config({ path: "./.env.local" });

// const uri = process.env.DATABASE_URL.replace(
//   "<db_password>",
//   process.env.DATABASE_PASSWORD
// );

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1uswq.mongodb.net/assets-management?retryWrites=true&w=majority`;


const client = new MongoClient(uri);

module.exports = client;
