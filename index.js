const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  downloadContentFromMessage,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");

const config = require('./config');
const { sms } = require('./lib/msg');
const {
  getGroupAdmins
} = require('./lib/functions');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94725364886'];
const sessionFolder = path.join(__dirname, '/auth_info_baileys/');


// ================== MONGODB CONNECT ==================

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

// ================== SESSION MODEL ==================

const sessionSchema = new mongoose.Schema({
  creds: Object,
  keys: Object
});

const Session = mongoose.model("Session", sessionSchema);


// ================== LOAD SESSION FROM MONGODB ==================

async function ensureMongoSession() {

  console.log("📂 Checking MongoDB session...");

  const sessionData = await Session.findOne();

  if (!sessionData) {
    console.log("❌ No session found in MongoDB");
    process.exit(1);
  }

  fs.mkdirSync(sessionFolder, { recursive: true });

  fs.writeFileSync(
    path.join(sessionFolder, "creds.json"),
    JSON.stringify(sessionData.creds, null, 2)
  );

  fs.writeFileSync(
    path.join(sessionFolder, "keys.json"),
    JSON.stringify(sessionData.keys, null, 2)
  );

  console.log("✅ Session loaded from MongoDB");

  connectToWA();
}


// ================== CONNECT TO WHATSAPP ==================

async function connectToWA() {

  console.log("𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐍𝐆 𝐎𝐒𝐇𝐈𝐘𝐀-𝐌𝐃❤️‍🔥");

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const test = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  // ================= SAVE SESSION TO MONGODB =================

  test.ev.on("creds.update", async () => {

    await saveCreds();

    const credsData = JSON.parse(
      fs.readFileSync(path.join(sessionFolder, "creds.json"))
    );

    const keysData = JSON.parse(
      fs.readFileSync(path.join(sessionFolder, "keys.json"))
    );

    await Session.findOneAndUpdate(
      {},
      { creds: credsData, keys: keysData },
      { upsert: true }
    );

    console.log("💾 Session Updated In MongoDB");
  });

  // ================= CONNECTION UPDATE =================

  test.ev.on('connection.update', async (update) => {

    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('𝐎𝐒𝐇𝐈𝐘𝐀-𝐗𝐌𝐃 𝐒𝐓𝐀𝐑𝐓𝐃 💫');
    }
  });

}

ensureMongoSession();

app.get("/", (req, res) => {
  res.send("𝐇𝐄𝐘 𝐎𝐒𝐇𝐈𝐘𝐀 𝐒𝐓𝐀𝐑𝐓𝐃💐");
});

app.listen(port, () =>
  console.log(`𝐒𝐄𝐑𝐕𝐄𝐑 𝐑𝐔𝐍𝐈𝐍𝐆 𝐎𝐒𝐇𝐈𝐘𝐀-𝐗𝐌𝐃✅`)
);