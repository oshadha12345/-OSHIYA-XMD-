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

const config = require('./config');
const { sms } = require('./lib/msg');
const { commands } = require('./command');
const { Settings, Session } = require('./lib/mongodb');

const app = express();
const port = process.env.PORT || 8000;

// --- 1. Plugins Loader ---
const loadPlugins = () => {
    const pluginsPath = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginsPath)) {
        fs.readdirSync(pluginsPath).forEach((file) => {
            if (file.endsWith('.js')) {
                try {
                    require(path.join(pluginsPath, file));
                    console.log(`✅ Loaded plugin: ${file}`);
                } catch (e) {
                    console.error(`❌ Error loading plugin ${file}:`, e);
                }
            }
        });
    }
};

loadPlugins();

// --- 2. Database & Utils ---
async function getDBSettings() {
    try {
        let settings = await Settings.findOne({ id: 'main_settings' });
        if (!settings) {
            settings = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false, 
                AUTO_MG_REACT: false, 
                AUTO_STATUS_SEEN: false, 
                AUTO_STATUS_REACT: false,
                WORK_TYPE: 'public', 
                PREFIX: config.PREFIX || '.' 
            });
        }
        return settings;
    } catch (e) {
        return { 
            AUTO_CALL_END: false, AUTO_MG_REACT: false, AUTO_STATUS_SEEN: false, 
            AUTO_STATUS_REACT: false, WORK_TYPE: 'public', PREFIX: '.'
        };
    }
}

const activeSessions = new Set();
const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];

function getLocalRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// --- 3. Combined Session Manager ---
async function startMultiSessionManager() {
    try {
        console.log("🔍 SCANNING FOR SESSIONS (CONFIG & DB)...");

        // 1. Config එකේ ඇති Session ID එක පරීක්ෂා කිරීම
        let configSID = config.SESSION_ID;
        if (configSID) {
            // ඉදිරියෙන් ᴏꜱʜɪʏᴀ~ නොමැති නම් එය එකතු කරයි
            if (!configSID.startsWith('ᴏꜱʜɪʏᴀ~')) {
                configSID = 'ᴏꜱʜɪʏᴀ~' + configSID;
            }
            await processSession(configSID);
        }

        // 2. MongoDB එකේ ඇති Sessions පරීක්ෂා කිරීම
        const dbSessions = await Session.find({ key: { $regex: /^ᴏꜱʜɪʏᴀ~/ } });
        for (let sessionDoc of dbSessions) {
            await processSession(sessionDoc.key, sessionDoc.value);
        }

    } catch (err) {
        console.error("❌ Session Manager Error:", err.message);
    }
}

async function processSession(sessionID, dbValue = null) {
    if (activeSessions.has(sessionID)) return;

    console.log(`✨ Initializing session: [${sessionID}]`);
    const folderPath = path.join(__dirname, `/auth_info_baileys/${sessionID}/`);
    const credsFile = path.join(folderPath, 'creds.json');

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    // DB එකෙන් ලැබුණු අගයක් ඇත්නම් එය භාවිතා කරයි, නැතහොත් Config එකෙන් එන session එක DB එකේ ඇති දැයි බලයි
    let finalValue = dbValue;
    if (!finalValue) {
        const found = await Session.findOne({ key: sessionID });
        if (found) finalValue = found.value;
    }

    if (finalValue) {
        const credsData = typeof finalValue === 'string' ? finalValue : JSON.stringify(finalValue);
        fs.writeFileSync(credsFile, credsData);
        activeSessions.add(sessionID);
        connectToWA(folderPath, sessionID);
    } else {
        console.log(`⚠️ No credentials found for ${sessionID}. Skipping...`);
    }
}

// තත්පර 30කට වරක් අලුත් sessions තිබේදැයි බලයි
async function continuousWatch() {
    await startMultiSessionManager();
    setTimeout(continuousWatch, 30000);
}

// --- 4. WhatsApp Connection Logic ---
async function connectToWA(authPath, sessionLabel) {
    console.log(`🚀 STARTING INSTANCE: [${sessionLabel}]`);
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const test = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        syncFullHistory: false,
        markOnlineOnConnect: true,
    });

    test.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWA(authPath, sessionLabel);
            } else {
                console.log(`❌ Session Logged Out: ${sessionLabel}`);
                activeSessions.delete(sessionLabel);
                if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD [${sessionLabel}] CONNECTED 💫`);
            const botNumber = jidNormalizedUser(test.user.id);
            await test.sendMessage(botNumber, { text: `🚀 OSHIYA-MD [${sessionLabel}] IS NOW ONLINE!` });
        }
    });

    test.ev.on('creds.update', saveCreds);

    test.ev.on("call", async (callData) => {
        const currentSett = await getDBSettings();
        if (currentSett.AUTO_CALL_END) {
            for (let call of callData) {
                if (call.status === "offer") {
                    await test.rejectCall(call.id, call.from);
                    await test.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓 - 𝐀𝐮𝐭𝐨 𝐁𝐥𝐨𝐜𝐤 𝐛𝐲 𝐁𝐨𝐭" });
                }
            }
        }
    });

    test.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;

        const mtype = getContentType(mek.message);
        mek.message = mtype === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        
        const from = mek.key.remoteJid;
        const body = (mtype === 'conversation') ? mek.message.conversation :
                     (mtype === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (mtype === 'imageMessage') ? mek.message.imageMessage.caption :
                     (mtype === 'videoMessage') ? mek.message.videoMessage.caption : '';

        const currentSett = await getDBSettings();
        const prefix = currentSett.PREFIX || '.';

        // Auto Status Seen & React
        if (from === 'status@broadcast') {
            if (currentSett.AUTO_STATUS_SEEN) await test.readMessages([mek.key]);
            if (currentSett.AUTO_STATUS_REACT) {
                const statusEmojis = ['❤️', '🔥', '💯', '✨', '💎'];
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await test.sendMessage(mek.key.participant, { react: { text: randomEmoji, key: mek.key } }, { statusForward: true });
            }
        }

        // Command Handler
        const isCmd = body.startsWith(prefix);
        if (isCmd) {
            const commandName = body.slice(prefix.length).trim().split(" ")[0].toLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(' ');

            const botNumber2 = jidNormalizedUser(test.user.id);
            const sender = mek.key.fromMe ? botNumber2 : (mek.key.participant || mek.key.remoteJid);
            const isOwner = mek.key.fromMe || (config.OWNER_NUMBER && config.OWNER_NUMBER.includes(sender.split('@')[0]));
            const isGroup = from.endsWith('@g.us');
            const pushname = mek.pushName || 'User';
            const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    await cmd.function(test, mek, sms(test, mek), {
                        from, body, isCmd, command: commandName, args, q, isGroup, sender, pushname, botNumber2, reply, isOwner
                    });
                } catch (e) { 
                    console.error("Command Error:", e); 
                }
            }
        }
    });
}

// ආරම්භ කිරීම
continuousWatch();

app.get("/", (req, res) => { 
    res.send(`OSHIYA-MD is running. Active Multi-Sessions: ${activeSessions.size}`); 
});

app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
