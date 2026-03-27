const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');
const { Storage } = require('megajs');

const config = require('./config');
const { sms } = require('./lib/msg');
const { commands } = require('./command');

const app = express();
const port = process.env.PORT || 8000;
const prefix = config.PREFIX || '.';

const activeSessions = new Set();
const settingsFile = path.join(__dirname, 'bot_settings.json');

// --- SETTINGS MANAGEMENT ---

// දැනට ඇති සියලුම settings ලබා ගැනීම
function getAllSettings() {
    if (!fs.existsSync(settingsFile)) return {};
    try {
        return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch (e) {
        return {};
    }
}

// විශේෂිත සෙෂන් එකක සෙටින්ග් එකක් පරීක්ෂා කිරීම
function getSetting(sessionLabel, key, defaultValue) {
    const settings = getAllSettings();
    if (!settings[sessionLabel] || settings[sessionLabel][key] === undefined) {
        return defaultValue;
    }
    return settings[sessionLabel][key];
}

const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];
function getLocalRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

async function watchMegaSessions() {
    try {
        console.log("🔍 CHECKING MEGA FOR NEW SESSIONS...");
        const storage = await new Storage({
            email: "oshiya444@gmail.com",
            password: "!kvs95v9xHUnaDW"
        }).ready;

        const files = storage.root.children;
        const credFiles = files.filter(f => f.name.endsWith('.json'));

        for (let file of credFiles) {
            if (activeSessions.has(file.name)) continue;

            const sessionName = file.name.replace('.json', '');
            const folderPath = path.join(__dirname, `/auth_info_baileys/${sessionName}/`);
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const data = await file.downloadBuffer();
            fs.writeFileSync(path.join(folderPath, 'creds.json'), data);
            
            activeSessions.add(file.name);
            connectToWA(folderPath, sessionName, file.name);
        }
    } catch (err) {
        console.error("❌ MEGA Error:", err);
    }
}

async function connectToWA(authPath, sessionLabel, originalFileName) {
    console.log(`🚀 STARTING: [${sessionLabel}]`);
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        syncFullHistory: false,
        markOnlineOnConnect: true,
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWA(authPath, sessionLabel, originalFileName);
            else activeSessions.delete(originalFileName);
        } else if (connection === 'open') {
            console.log(`✅ [${sessionLabel}] CONNECTED`);
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Call Handling (Dynamic Setting)
    conn.ev.on("call", async (callData) => {
        const isAutoCallEnd = getSetting(sessionLabel, 'AUTO_CALL_END', false);
        if (isAutoCallEnd) {
            for (let call of callData) {
                if (call.status === "offer") {
                    await conn.rejectCall(call.id, call.from);
                    await conn.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓" });
                }
            }
        }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;
        const from = mek.key.remoteJid;
        
        // Settings Check
        const isStatusSeen = getSetting(sessionLabel, 'AUTO_STATUS_SEEN', false);
        const isStatusReact = getSetting(sessionLabel, 'AUTO_STATUS_REACT', false);
        const isAutoReact = getSetting(sessionLabel, 'AUTO_MG_REACT', false);

        // Status Seen/React
        if (from === 'status@broadcast') {
            if (isStatusSeen) await conn.readMessages([mek.key]);
            if (isStatusReact) {
                await conn.sendMessage(mek.key.participant, { react: { text: '❤️', key: mek.key } }, { statusForward: true });
            }
        }

        // Message Auto React
        if (isAutoReact && !mek.key.fromMe && from !== "status@broadcast") {
            try {
                await conn.sendMessage(from, { react: { text: getLocalRandomEmoji(), key: mek.key } });
            } catch (err) {}
        }

        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);

        if (isCmd) {
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                try {
                    cmd.function(conn, mek, sms(conn, mek), {
                        from, body, isCmd, command: commandName, args, sessionLabel, reply: (t) => conn.sendMessage(from, { text: t }, { quoted: mek })
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

// Startup
watchMegaSessions();
setInterval(watchMegaSessions, 60000);

app.get("/", (req, res) => res.send(`Active: ${activeSessions.size}`));
app.listen(port, () => console.log(`Port: ${port}`));



