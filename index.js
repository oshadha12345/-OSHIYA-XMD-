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
const settingsPath = path.join(__dirname, 'settings.json');

// --- Helper: Settings කියවීමට ---
function getCurrentSettings() {
    if (!fs.existsSync(settingsPath)) {
        return { 
            AUTO_CALL_END: false, 
            AUTO_MG_REACT: false, 
            AUTO_STATUS_SEEN: false, 
            AUTO_STATUS_REACT: false 
        };
    }
    try {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
        return {};
    }
}

const activeSessions = new Set();
const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];

function getLocalRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ෆෝල්ඩරයක් සම්පූර්ණයෙන්ම මකා දැමීමේ function එක
function deleteSessionFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted invalid session folder: ${folderPath}`);
    }
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
        console.error("❌ MEGA Watcher Error:", err);
    }
}

async function connectToWA(authPath, sessionLabel, originalFileName) {
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
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(`🔄 Reconnecting session: [${sessionLabel}]...`);
                connectToWA(authPath, sessionLabel, originalFileName);
            } else {
                // සෙෂන් එක Logged Out නම් හෝ වැඩ කරන්නේ නැතිනම් දත්ත මකා දමයි
                console.log(`❌ Session [${sessionLabel}] is INVALID/LOGGED OUT. Deleting...`);
                activeSessions.delete(originalFileName);
                deleteSessionFolder(authPath);
            }
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD [${sessionLabel}] CONNECTED 💫`);
            const owner = config.OWNER_NUMBER + "@s.whatsapp.net";
            await test.sendMessage(owner, { text: `🚀 OSHIYA-MD [${sessionLabel}] IS NOW ONLINE!` });
        }
    });

    test.ev.on('creds.update', saveCreds);

    test.ev.on("call", async (callData) => {
        const currentSett = getCurrentSettings();
        if (currentSett.AUTO_CALL_END) {
            for (let call of callData) {
                if (call.status === "offer") {
                    await test.rejectCall(call.id, call.from);
                    await test.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓" });
                }
            }
        }
    });

    test.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;
        const from = mek.key.remoteJid;
        
        // Settings load කිරීම
        const currentSett = getCurrentSettings();

        // Auto Status/React logic
        if (from === 'status@broadcast') {
            if (currentSett.AUTO_STATUS_SEEN) await test.readMessages([mek.key]);
            if (currentSett.AUTO_STATUS_REACT) {
                const statusEmojis = ['❤️', '🔥', '💯', '✨', '💎'];
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await test.sendMessage(mek.key.participant, { react: { text: randomEmoji, key: mek.key } }, { statusForward: true });
            }
        }

        // Command handling
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type == 'imageMessage') ? mek.message.imageMessage.caption :
                     (type == 'videoMessage') ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        if (isCmd) {
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                const sender = mek.key.fromMe ? test.user.id : (mek.key.participant || mek.key.remoteJid);
                const pushname = mek.pushName || 'User';
                const botNumber2 = await jidNormalizedUser(test.user.id);
                const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

                try {
                    cmd.function(test, mek, sms(test, mek), {
                        from, body, isCmd, command: commandName, args, q, isGroup: from.endsWith('@g.us'), sender, pushname, botNumber2, reply
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

// Startup
watchMegaSessions();
setInterval(() => watchMegaSessions(), 30000);

app.get("/", (req, res) => { res.send(`Oshi MD Active Sessions: ${activeSessions.size} ✅`); });
app.listen(port, () => console.log(`Server started on port ${port}`));
