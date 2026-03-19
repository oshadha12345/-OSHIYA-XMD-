const { MongoClient } = require("mongodb");

// MongoDB URI replace කරන්න ඔයාගේ URI එකෙන්
const client = new MongoClient("mongodb+srv://oshadhaoshadha12345_db_user:SH0m8ksHl8A0ZfBF@oshiya.bc9b5e4.mongodb.net/?appName=Oshiya");

let collection;
let DBCONFIG = {};

async function connectDB() {
  await client.connect();
  const db = client.db("oshiya");
  collection = db.collection("config");

  let data = await collection.findOne({ key: "config" });

  if (!data) {
    await collection.insertOne({
      key: "config",
      AUTO_TYPING: true,
      AUTO_RECORDING: false,
      AUTO_ONLINE: true
    });
    data = await collection.findOne({ key: "config" });
  }

  DBCONFIG = data;
}

async function refreshDB() {
  DBCONFIG = await collection.findOne({ key: "config" });
}

module.exports = {
  connectDB,
  refreshDB,
  get DBCONFIG() { return DBCONFIG; },
  collection
};
