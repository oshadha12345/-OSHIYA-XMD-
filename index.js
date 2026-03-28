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

// Config සහ Libs
const config = require('./config');
const { sms } = require('./lib/msg');
const { commands } = require('./command'); // Commands array එක මෙතනින් එනවා
const { Settings } = require('./lib/mongodb'); 

const app = express();
const port = process.env.PORT || 8000;

console.log("🛠️ OSHIYA-MD Loading...");

// --- MongoDB Settings Fetcher ---
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
                AUTO_TYPING: false,
                WORK_TYPE: 'public', 
                PREFIX: '.' 
            });
        }
        return settings;
    } catch (e) {
        return { 
            AUTO_CALL_END: false, AUTO_MG_REACT: false, AUTO_STATUS_SEEN: false, 
            AUTO_STATUS_REACT: false, AUTO_TYPING: false, WORK_TYPE: 'public', PREFIX: '.'
        };
    }
}

const activeSessions = new Set();

// --- MEGA Watcher Logic ---
async function watchMegaSessions() {
    try {
        console.log("🔍 SCANNING MEGA FOR UPDATES...");
        const storage = await new Storage({
            email: "oshiya444@gmail.com",
            password: "oshiya444"
        }).ready;

        const files = storage.root.children;
        const credFiles = files.filter(f => f.name.endsWith('.json'));

        for (let file of credFiles) {
            if (activeSessions.has(file.name)) continue;
            
            console.log(`✨ New session detected: [${file.name}]`);
            const sessionName = file.name.replace('.json', '');
            const folderPath = path.join(__dirname, `/auth_info_baileys/${sessionName}/`);
            const credsFile = path.join(folderPath, 'creds.json');
            
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            
            const data = await file.downloadBuffer();
            fs.writeFileSync(credsFile, data);
            activeSessions.add(file.name);
            
            connectToWA(folderPath, sessionName, file.name);
        }
    } catch (err) {
        console.error("❌ MEGA Watcher Error:", err.message);
    }
}

async function continuousWatch() {
    await watchMegaSessions();
    setTimeout(continuousWatch, 30000); 
}

async function connectToWA(authPath, sessionLabel, originalFileName) {
    console.log(`🚀 STARTING INSTANCE: [${sessionLabel}]`);
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
            else {
                console.log(`❌ Session Logged Out: ${sessionLabel}`);
                activeSessions.delete(originalFileName);
            }
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD [${sessionLabel}] CONNECTED 💫`);
            const botNumber = jidNormalizedUser(conn.user.id);
            await conn.sendMessage(botNumber, { text: `🚀 OSHIYA-MD [${sessionLabel}] IS NOW ONLINE!` });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;
        
        const from = mek.key.remoteJid;
        const type = getContentType(mek.message);
        
        // --- Body Extraction (වැඩි දියුණු කළ කොටස) ---
        let body = "";
        if (type === 'conversation') body = mek.message.conversation;
        else if (type === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
        else if (type === 'imageMessage') body = mek.message.imageMessage.caption;
        else if (type === 'videoMessage') body = mek.message.videoMessage.caption;
        else if (type === 'templateButtonReplyMessage') body = mek.message.templateButtonReplyMessage.selectedId;
        else if (type === 'buttonsResponseMessage') body = mek.message.buttonsResponseMessage.selectedButtonId;
        else if (type === 'listResponseMessage') body = mek.message.listResponseMessage.singleSelectReply.selectedRowId;
        else if (type === 'interactiveResponseMessage') body = JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponse.paramsJson).id;
        
        // Ephemeral support
        if (type === 'ephemeralMessage') {
            const subType = getContentType(mek.message.ephemeralMessage.message);
            if (subType === 'extendedTextMessage') body = mek.message.ephemeralMessage.message.extendedTextMessage.text;
            else if (subType === 'conversation') body = mek.message.ephemeralMessage.message.conversation;
        }

        const currentSett = await getDBSettings();
        const prefix = currentSett.PREFIX || config.PREFIX || '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : false;
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        const botNumber = jidNormalizedUser(conn.user.id);
        const sender = mek.key.fromMe ? botNumber : (mek.key.participant || mek.key.remoteJid);
        const isOwner = config.OWNER_NUMBER.includes(sender.split('@')[0]) || mek.key.fromMe;
        const pushname = mek.pushName || 'User';
        const isGroup = from.endsWith('@g.us');

        const reply = (text) => conn.sendMessage(from, { text: text }, { quoted: mek });

        // Settings Logic
        if (currentSett.AUTO_TYPING && !mek.key.fromMe) conn.sendPresenceUpdate('composing', from);

        // Command Execution Logic
        if (isCmd) {
            if (currentSett.WORK_TYPE === 'private' && !isOwner) return;

            const cmd = commands.find((c) => c.pattern === command || (c.alias && c.alias.includes(command)));

            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                
                try {
                    const msg = sms(conn, mek);
                    await cmd.function(conn, mek, msg, {
                        from, prefix, body, isCmd, command, args, q, isGroup, sender, pushname, botNumber, isOwner, reply
                    });
                } catch (e) {
                    console.error("Command Error:", e);
                    // reply("Error: " + e.message); // අවශ්‍ය නම් පමණක් පාවිච්චි කරන්න
                }
            }
        }
    });

    // Call End Logic
    conn.ev.on("call", async (calls) => {
        const settings = await getDBSettings();
        if (settings.AUTO_CALL_END) {
            for (let call of calls) {
                if (call.status === "offer") {
                    await conn.rejectCall(call.id, call.from);
                }
            }
        }
    });
}

// Start
continuousWatch();

app.get("/", (req, res) => { 
    res.send(`OSHIYA-MD active sessions: ${activeSessions.size}`); 
});

app.listen(port, () => console.log(`🚀 Port: ${port}`));
