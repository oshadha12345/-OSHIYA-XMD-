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
const { Settings } = require('./lib/mongodb'); 

const app = express();
const port = process.env.PORT || 8000;

// --- 1. Plugins Loader Logic ---
// මෙමගින් plugins folder එකේ ඇති සියලුම .js ගොනු load කරනු ලබයි.
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

loadPlugins(); // ආරම්භයේදීම විධාන load කරන්න

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
            if (shouldReconnect) connectToWA(authPath, sessionLabel, originalFileName);
            else {
                console.log(`❌ Session Logged Out: ${sessionLabel}`);
                activeSessions.delete(originalFileName);
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
                    await test.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓 - 𝐀𝐮𝐭ො 𝐁𝐥ො𝐜𝐤 𝐛𝐲 𝐁ොට්" });
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

        // 1. "oshiya" Contact Command
        if (body && body.toLowerCase() === 'oshiya') {
            const vcard = 'BEGIN:VCARD\n'
                + 'VERSION:3.0\n' 
                + 'FN:OSHIYA\n'
                + 'ORG:OSHIYA-MD;\n' 
                + 'TEL;type=CELL;type=VOICE;waid=94756599952:+94 75 659 9952\n'
                + 'END:VCARD';

            await test.sendMessage(from, { 
                contacts: { 
                    displayName: 'OSHIYA', 
                    contacts: [{ vcard }] 
                }
            }, { quoted: mek });
            await test.sendMessage(from, { react: { text: "👤", key: mek.key } });
        }

        // 2. Auto Message React
        if (currentSett.AUTO_MG_REACT && !mek.key.fromMe && from !== "status@broadcast") {
            try { await test.sendMessage(from, { react: { text: getLocalRandomEmoji(), key: mek.key } }); } catch (err) {}
        }

        // 3. Status Auto Seen & React
        if (from === 'status@broadcast') {
            if (currentSett.AUTO_STATUS_SEEN) await test.readMessages([mek.key]);
            if (currentSett.AUTO_STATUS_REACT) {
                const statusEmojis = ['❤️', '🔥', '💯', '✨', '💎'];
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await test.sendMessage(mek.key.participant, { react: { text: randomEmoji, key: mek.key } }, { statusForward: true });
            }
        }

        // 4. Command Handler
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const botNumber2 = jidNormalizedUser(test.user.id);
        const sender = mek.key.fromMe ? botNumber2 : (mek.key.participant || mek.key.remoteJid);
        const isOwner = mek.key.fromMe || (config.OWNER_NUMBER && config.OWNER_NUMBER.includes(sender.split('@')[0]));
        const isGroup = from.endsWith('@g.us');
        const pushname = mek.pushName || 'User';
        const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

        if (isCmd) {
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

continuousWatch();

app.get("/", (req, res) => { 
    res.send(`OSHIYA-MD is running. Active Sessions: ${activeSessions.size}`); 
});

app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
