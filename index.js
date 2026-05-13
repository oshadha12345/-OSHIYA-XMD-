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
const { Storage } = require('megajs'); // Mega.nz සඳහා

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
                } catch (e) {
                    console.error(`❌ Error loading plugin ${file}:`, e);
                }
            }
        });
        console.log(`✅ Plugins Loaded.`);
    }
};
loadPlugins();

// --- 2. Database Utils ---
async function getDBSettings() {
    try {
        let settings = await Settings.findOne({ id: 'main_settings' });
        if (!settings) {
            settings = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false, 
                WORK_TYPE: 'public', 
                PREFIX: config.PREFIX || '.' 
            });
        }
        return settings;
    } catch (e) {
        return { PREFIX: config.PREFIX || '.' };
    }
}

const activeSessions = new Map();

// --- 3. Mega.nz Session Downloader ---
// සටහන: මෙහි EMAIL සහ PASSWORD ඔබගේ ගිණුමට අනුව config එකට එක් කරන්න.
async function syncFromMega() {
    try {
        if (!config.MEGA_EMAIL || !config.MEGA_PASSWORD) {
            console.log("⚠️ Mega credentials not provided. Skipping Mega sync.");
            return;
        }

        const storage = await new Storage({
            email: config.MEGA_EMAIL,
            password: config.MEGA_PASSWORD
        }).ready;

        console.log("📂 Connected to Mega.nz. Searching for sessions...");

        // Mega ගිණුමේ ඇති සියලුම ගොනු පරීක්ෂා කිරීම
        for (const file of Object.values(storage.files)) {
            if (file.name === 'creds.json') {
                // Folder එකේ නම Session ID එක ලෙස සලකයි
                const sessionID = file.parent.name; 
                if (sessionID && sessionID.startsWith('ᴏꜱʜɪʏᴀ~')) {
                    const data = await file.downloadBuffer();
                    await processSession(sessionID, data.toString());
                }
            }
        }
    } catch (err) {
        console.error("❌ Mega Sync Error:", err.message);
    }
}

// --- 4. Session Processor ---
async function processSession(sessionID, credsContent = null) {
    if (activeSessions.has(sessionID)) return;

    // Folder නමේ ඇති විශේෂ අකුරු ඉවත් කර පද්ධතියට ගැළපෙන ලෙස සකසයි
    const safeFolderName = sessionID.replace(/[^a-zA-Z0-9]/g, '_');
    const folderPath = path.join(__dirname, 'auth_info_baileys', safeFolderName);
    const credsFile = path.join(folderPath, 'creds.json');

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let finalValue = credsContent;
    if (!finalValue) {
        const found = await Session.findOne({ key: sessionID });
        if (found) finalValue = found.value;
    }

    if (finalValue) {
        try {
            fs.writeFileSync(credsFile, typeof finalValue === 'string' ? finalValue : JSON.stringify(finalValue));
            activeSessions.set(sessionID, true);
            await connectToWA(folderPath, sessionID);
        } catch (err) {
            console.error(`❌ Failed to save session ${sessionID}:`, err);
        }
    }
}

// --- 5. WhatsApp Connection ---
async function connectToWA(authPath, sessionLabel) {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Desktop"),
        auth: state,
        version
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                setTimeout(() => connectToWA(authPath, sessionLabel), 5000);
            } else {
                console.log(`❌ Session Logged Out: ${sessionLabel}`);
                activeSessions.delete(sessionLabel);
                if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-MD [${sessionLabel}] CONNECTED!`);
            await conn.sendMessage(jidNormalizedUser(conn.user.id), { text: `🚀 Session ${sessionLabel} is now active!` });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Message Handler
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek.message) return;

        const mtype = getContentType(mek.message);
        const body = (mtype === 'conversation') ? mek.message.conversation :
                     (mtype === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (mtype === 'imageMessage') ? mek.message.imageMessage.caption :
                     (mtype === 'videoMessage') ? mek.message.videoMessage.caption : '';

        const settings = await getDBSettings();
        const prefix = settings.PREFIX || '.';

        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const q = args.join(' ');
            
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                try {
                    await cmd.function(conn, mek, sms(conn, mek), {
                        from: mek.key.remoteJid, body, args, q, isGroup: mek.key.remoteJid.endsWith('@g.us'),
                        sender: mek.key.participant || mek.key.remoteJid,
                        reply: (text) => conn.sendMessage(mek.key.remoteJid, { text }, { quoted: mek })
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

// --- 6. Main Runner ---
async function main() {
    await syncFromMega(); // Mega එකෙන් මුලින්ම ගන්න
    await startMultiSessionManager(); // DB එකෙන් ඊළඟට
}

async function startMultiSessionManager() {
    const dbSessions = await Session.find({ key: { $regex: /^ᴏꜱʜɪʏᴀ~/ } });
    for (let sessionDoc of dbSessions) {
        await processSession(sessionDoc.key, sessionDoc.value);
    }
}

// සෑම විනාඩි 5කට වරක් අලුත් Session තිබේදැයි බලයි
setInterval(main, 300000);
main();

app.get("/", (req, res) => { res.send(`Active Sessions: ${activeSessions.size}`); });
app.listen(port, () => console.log(`🚀 Server on port ${port}`));
