const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
  downloadContentFromMessage,
  DisconnectReason
} = require('baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { Storage } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94725364886'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
if (!fs.existsSync(credsPath)) {
if (!config.SESSION_ID) {
console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
process.exit(1);
}

console.log("𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐋𝐎𝐀𝐃𝐈𝐍𝐆 📂");  

let sessdata = config.SESSION_ID.trim().replace(/^ᴏꜱʜɪʏᴀ~/, '');  
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);  

filer.download((err, data) => {  
  if (err) {  
    console.error("❌ Failed to download session file from MEGA:", err);  
    process.exit(1);  
  }  

  fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });  
  fs.writeFileSync(credsPath, data);  
  console.log("✅ 𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 𝐒𝐀𝐕𝐄 ✅");  
  setTimeout(() => {  
    connectToWA();  
  }, 2000);  
});

} else {
setTimeout(() => {
connectToWA();
}, 1000);
}
}

const antiDeletePlugin = require('./plugins/antidelete.js');
global.pluginHooks = global.pluginHooks || [];
global.pluginHooks.push(antiDeletePlugin);

async function connectToWA() {
console.log("𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐍𝐆 𝐎𝐒𝐇𝐈𝐘𝐀-𝐌𝐃❤️‍🔥");
const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
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

test.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update;
if (connection === 'close') {
if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
connectToWA();
}
} else if (connection === 'open') {
console.log('𝐎𝐒𝐇𝐈𝐘𝐀-𝐗𝐌𝐃 𝐒𝐓𝐀𝐑𝐓𝐃 💫');

// ✅ Auto Change About (Bio)
try {
await test.updateProfileStatus("OSHIYA-MD");
console.log("✅ 𝐀𝐁𝐎𝐔𝐓 𝐔𝐏𝐃𝐀𝐓𝐄");
} catch (err) {
console.log("❌ Failed to update About:", err);
}

const up = `╔══════════════════════════╗  
    ✦  W E L C O M E  ✦

╚══════════════════════════╝

Hello & Welcome 🤍

Thank you for connecting with our Official WhatsApp Service.

━━━━━━━━━━━━━━━━━━

💎 Premium Quality Support
⚡ Fast & Reliable Responses
🔒 100% Secure & Trusted
🌟 Professional Assistance

━━━━━━━━━━━━━━━━━━

Please send your request or inquiry below.
Our team will respond shortly.

✨ We Appreciate Your Trust ✨;   await test.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {   image: { url: `https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg` },
caption: up
});

// ✅ LOAD PLUGINS HERE  
  fs.readdirSync("./plugins/").forEach((plugin) => {  
    if (path.extname(plugin).toLowerCase() === ".js") {  
      require(`./plugins/${plugin}`);  
    }  
  });  

}

});

test.ev.on('creds.update', saveCreds);

test.ev.on('messages.upsert', async ({ messages }) => {
for (const msg of messages) {
if (msg.messageStubType === 68) {
await test.sendMessageAck(msg.key);
}
}

const mek = messages[0];  
if (!mek || !mek.message) return;  
mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;  
 

    if (global.pluginHooks) {  
  for (const plugin of global.pluginHooks) {  
    if (plugin.onMessage) {  
      try {  
        await plugin.onMessage(test, mek);  
      } catch (e) {  
        console.log("onMessage error:", e);  
      }  
    }  
  }  
}

if (mek.key?.remoteJid === 'status@broadcast') {
const senderJid = mek.key.participant || mek.key.remoteJid || "unknown@s.whatsapp.net";
const mentionJid = senderJid.includes("@s.whatsapp.net") ? senderJid : senderJid + "@s.whatsapp.net";

if (config.AUTO_STATUS_SEEN === "true") {
try {
await test.readMessages([mek.key]);
console.log([✓] Status seen: ${mek.key.id});
} catch (e) {
console.error("❌ Failed to mark status as seen:", e);
}
}

if (config.AUTO_STATUS_REACT === "true" && mek.key.participant) {
try {
const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

await test.sendMessage(mek.key.participant, {  
    react: {  
      text: randomEmoji,  
      key: mek.key,  
    }  
  });  

  console.log(`[✓] Reacted to status of ${mek.key.participant} with ${randomEmoji}`);  
} catch (e) {  
  console.error("❌ Failed to react to status:", e);  
}

}

if (config.AUTO_STATUS_SEND === "true" &&
mek.message?.extendedTextMessage &&
!mek.message.imageMessage &&
!mek.message.videoMessage) {
const text = mek.message.extendedTextMessage.text || "";
if (text.trim().length > 0) {
try {
await test.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
text: 📝 *Text Status*\n👤 From: @${mentionJid.split("@")[0]}\n\n${text},
mentions: [mentionJid]
});
console.log(✅ Text-only status from ${mentionJid} forwarded.);
} catch (e) {
console.error("❌ Failed to forward text status:", e);
}
}
}

if (config.AUTO_STATUS_SEND === "true" &&
(mek.message?.imageMessage || mek.message?.videoMessage)) {
try {
const msgType = mek.message.imageMessage ? "imageMessage" : "videoMessage";
const mediaMsg = mek.message[msgType];

const stream = await downloadContentFromMessage(  
    mediaMsg,  
    msgType === "imageMessage" ? "image" : "video"  
  );  

  let buffer = Buffer.from([]);  
  for await (const chunk of stream) {  
    buffer = Buffer.concat([buffer, chunk]);  
  }  

  const mimetype = mediaMsg.mimetype || (msgType === "imageMessage" ? "image/jpeg" : "video/mp4");  
  const captionText = mediaMsg.caption || "";  

  await test.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {  
    [msgType === "imageMessage" ? "image" : "video"]: buffer,  
    mimetype,  
    caption: `📥 *Forwarded Status*\n👤 From: @${mentionJid.split("@")[0]}\n\n${captionText}`,  
    mentions: [mentionJid]  
  });  

  console.log(`✅ Media status from ${mentionJid} forwarded.`);  
} catch (err) {  
  console.error("❌ Failed to download or forward media status:", err);  
}

}
}

const m = sms(test, mek)
const type = getContentType(mek.message)
const content = JSON.stringify(mek.message)
const from = mek.key.remoteJid
const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
const body = (type === 'conversation') ? mek.message.conversation :
(type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
(type == 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
(type == 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption : '';
const isCmd = body.startsWith(prefix);
const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1);
const q = args.join(' ');

const sender = mek.key.fromMe ? test.user.id : (mek.key.participant || mek.key.remoteJid);  
const senderNumber = sender.split('@')[0];  
const isGroup = from.endsWith('@g.us');  
const botNumber = test.user.id.split(':')[0];  
const pushname = mek.pushName || 'Sin Nombre';  
const isMe = botNumber.includes(senderNumber);  
const isOwner = ownerNumber.includes(senderNumber) || isMe;  
const botNumber2 = await jidNormalizedUser(test.user.id);  

const groupMetadata = isGroup ? await test.groupMetadata(from).catch(() => {}) : '';  
const groupName = isGroup ? groupMetadata.subject : '';  
const participants = isGroup ? groupMetadata.participants : '';  
const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';  
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;  
const isAdmins = isGroup ? groupAdmins.includes(sender) : false;  

const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });  

if (isCmd) {  
  const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));  
  if (cmd) {  
    if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });  
    try {  
      cmd.function(test, mek, m, {  
        from, quoted: mek, body, isCmd, command: commandName, args, q,  
        isGroup, sender, senderNumber, botNumber2, botNumber, pushname,  
        isMe, isOwner, groupMetadata, groupName, participants, groupAdmins,  
        isBotAdmins, isAdmins, reply,  
      });  
    } catch (e) {  
      console.error("[PLUGIN ERROR]", e);  
    }  
  }  
}  

const replyText = body;  
for (const handler of replyHandlers) {  
  if (handler.filter(replyText, { sender, message: mek })) {  
    try {  
      await handler.function(test, mek, m, {  
        from, quoted: mek, body: replyText, sender, reply,  
      });  
      break;  
    } catch (e) {  
      console.log("Reply handler error:", e);  
    }  
  }  
}

});

test.ev.on('messages.update', async (updates) => {
if (global.pluginHooks) {
for (const plugin of global.pluginHooks) {
if (plugin.onDelete) {
try {
await plugin.onDelete(test, updates);
} catch (e) {
console.log("onDelete error:", e);
}
}
}
}
});
}

ensureSessionFile();

app.get("/", (req, res) => {
res.send("𝐇𝐄𝐘 𝐎𝐒𝐇𝐈𝐘𝐀 𝐒𝐓𝐀𝐑𝐓𝐃💐");
});

app.listen(port, () => console.log(𝐒𝐄𝐑𝐕𝐄𝐑 𝐑𝐔𝐍𝐈𝐍𝐆 𝐎𝐒𝐇𝐈𝐘𝐀-𝐗𝐌𝐃✅));

me code eke hari thanata patha code eka danna

async function ensureSessionFile() {
if (fs.existsSync(credsPath)) {
console.log("✅ Local session found");
return connectToWA();
}

console.log("📂 No local session found. Logging into MEGA...");

const storage = new Storage({
email: "oshiya444@gmail.com",
password: "oshiya444@gmail.com",
});

storage.on("ready", async () => {
console.log("✅ MEGA Login Success");

const files = Object.values(storage.files);  

// Find all creds.json files  
const sessionFiles = files.filter(file =>  
  file.name && file.name.toLowerCase().includes("creds")  
);  

if (sessionFiles.length === 0) {  
  console.log("❌ No session files found in MEGA");  
  process.exit(1);  
}  

console.log(`🔎 Found ${sessionFiles.length} session file(s). Trying one by one...`);  

for (const file of sessionFiles) {  
  try {  
    await new Promise((resolve, reject) => {  
      file.download((err, data) => {  
        if (err) return reject(err);  

        fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });  
        fs.writeFileSync(credsPath, data);  

        console.log(`✅ Trying Session: ${file.name}`);  
        resolve();  
      });  
    });  

    // Try connect  
    return connectToWA();  

  } catch (err) {  
    console.log(`❌ Failed session: ${file.name}`);  
  }  
}  

console.log("❌ All sessions failed.");  
process.exit(1);

});

storage.on("error", (err) => {
console.error("❌ MEGA Login Failed:", err);
process.exit(1);
});
  }
