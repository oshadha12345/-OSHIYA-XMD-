const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
getContentType,
proto,
generateWAMessageContent,
generateWAMessage,
AnyMessageContent,
prepareWAMessageMedia,
areJidsSameUser,
downloadContentFromMessage,
MessageRetryMap,
generateForwardMessageContent,
generateWAMessageFromContent,
generateMessageID,
makeInMemoryStore,
jidDecode,
fetchLatestBaileysVersion,
Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const ownerNumber = config.OWNER_NUMBER;
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
if (!fs.existsSync(credsPath)) {

if (!config.SESSION_ID) {
console.error('❌ SESSION ID MISSING');
process.exit(1);
}

console.log("🧬 SESSION DOWNLOADING 🧬");

const sessdata = config.SESSION_ID.replace(/^ᴏꜱʜɪʏᴀ~/, '');
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);

filer.download((err, data) => {

if (err) {
console.error("❌ FAILED DOWNLOAD ERROR", err);
process.exit(1);
}

fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
fs.writeFileSync(credsPath, data);
console.log("💥 SESSION SAVED 💥");

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

console.log("Connecting test-MD 🧬...");

const { state, saveCreds } = await useMultiFileAuthState(
path.join(__dirname, '/auth_info_baileys/')
);

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

console.log('💥 OSHIYA-MD CONNECTED TO WHATSAPP 💥');

const up = `test-MD connected ✅

PREFIX: ${prefix}`;

await test.sendMessage(test.user.id, {
image: {
url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg"
},
caption: up
});

fs.readdirSync("./plugins/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() === ".js") {
require(`./plugins/${plugin}`);
}
});

}

});

test.ev.on('creds.update', saveCreds);

test.ev.on('messages.upsert', async ({ messages }) => {

const mek = messages[0];
if (!mek || !mek.message) return;

mek.message =
getContentType(mek.message) === 'ephemeralMessage'
? mek.message.ephemeralMessage.message
: mek.message;

if (mek.key?.remoteJid === 'status@broadcast') {

if (config.AUTO_STATUS_SEEN === "true") {
try {
await test.readMessages([mek.key]);
console.log(`✓ Status seen: ${mek.key.id}`);
} catch (e) {
console.error("Failed to mark status as seen:", e);
}
}

if (config.AUTO_STATUS_REACT === "true" && mek.key.participant) {
try {

const emojis = ['❤️','🔥','💯','💎','😎','🌸','🖤','💚'];
const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

await test.sendMessage(mek.key.participant, {
react: {
text: randomEmoji,
key: mek.key,
}
});

console.log(`✓ Reacted to status with ${randomEmoji}`);

} catch (e) {
console.error("Failed to react:", e);
}
}

}

});

}

ensureSessionFile();

app.get("/", (req, res) => {
res.send("HEY, OSHIYA MD START 💥");
});

app.listen(port, () =>
console.log(`Server listening on http://localhost:${port}`)
);
