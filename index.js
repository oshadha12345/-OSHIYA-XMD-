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
const { Storage } = require('megajs'); // MEGA library eka

const config = require('./config');
const { sms } = require('./lib/msg');
const { getRandomEmoji } = require('./lib/functions'); // Meka lib eke naththan pahatha function eka use wenawa
const { commands } = require('./command');

const app = express();
const port = process.env.PORT || 8000;
const prefix = config.PREFIX || '.';

// Emoji list ekak (Kalin thibuna widiyatama)
const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];
function getLocalRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * MEGA Account eken creds.json files okkoma kiyawaa 
 * ewa session folders walata wen karaganeema.
 */
async function ensureSessionFile() {
    try {
        console.log("🔐 LOGGING INTO MEGA ACCOUNT...");
        
        const storage = await new Storage({
            email: "oshiya444@gmail.com",
            password: "!kvs95v9xHUnaDW"
        }).ready;

        // Account eke thiyena okkoma files check karanawa
        const files = storage.root.children;
        const credFiles = files.filter(f => f.name.endsWith('.json'));

        if (credFiles.length === 0) {
            console.error('❌ No creds.json files found in MEGA account.');
            return;
        }

        console.log(`📂 Found ${credFiles.length} potential sessions. Starting...`);

        for (let [index, file] of credFiles.entries()) {
            const sessionID = `session_${index + 1}`;
            const folderPath = path.join(__dirname, `/auth_info_baileys/${sessionID}/`);
            const credsFile = path.join(folderPath, 'creds.json');

            // Folder eka nathan hadanawa
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // File eka download karaa
            const data = await file.downloadBuffer();
            fs.writeFileSync(credsFile, data);
            
            console.log(`✅ Session [${file.name}] saved as ${sessionID}`);
            
            // Bot instance eka start kirima (RAM eka hira novanna delay ekak damma)
            setTimeout(() => {
                connectToWA(folderPath, sessionID);
            }, index * 5000); 
        }

    } catch (err) {
        console.error("❌ MEGA Login Error:", err);
    }
}

/**
 * Thani bot connection ekak hadana main function eka
 */
async function connectToWA(authPath, sessionLabel) {
    console.log(`🚀 CONNECTING OSHIYA-MD [${sessionLabel}]`);
    
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const test = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        syncFullHistory: false, // RAM eka ithuru kara ganeemata
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
    });

    // --- CONNECTION UPDATES ---
    test.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWA(authPath, sessionLabel);
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD [${sessionLabel}] STARTED 💫`);

            try {
                await test.updateProfileStatus(`OSHIYA-MD V1 Active ✅`);
            } catch (e) {}

            const owner = config.OWNER_NUMBER + "@s.whatsapp.net";
            await test.sendMessage(owner, { text: `𝐑𝐄𝐒𝐓𝐀𝐑𝐓𝐈𝐍𝐆 [${sessionLabel}] . . . ✅` });

            // Plugins Loading
            const pluginPath = path.join(__dirname, 'plugins');
            if (fs.existsSync(pluginPath)) {
                fs.readdirSync(pluginPath).forEach((plugin) => {
                    if (path.extname(plugin).toLowerCase() === ".js") {
                        try { require(`./plugins/${plugin}`); } catch (e) {}
                    }
                });
            }
        }
    });

    test.ev.on('creds.update', saveCreds);

    // --- CALL HANDLING ---
    test.ev.on("call", async (callData) => {
        if (config.AUTO_CALL_END === "true" || config.AUTO_CALL_END === true) {
            for (let call of callData) {
                if (call.status === "offer") {
                    await test.rejectCall(call.id, call.from);
                    await test.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓" });
                }
            }
        }
    });

    // --- MESSAGE HANDLING ---
    test.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;

        const from = mek.key.remoteJid;
        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

        // Auto React
        if ((config.AUTO_MG_REACT === "true" || config.AUTO_MG_REACT === true) && !mek.key.fromMe && from !== "status@broadcast") {
            try {
                await test.sendMessage(from, { react: { text: getLocalRandomEmoji(), key: mek.key } });
            } catch (err) {}
        }

        // Status Seen/React
        if (from === 'status@broadcast') {
            if (config.AUTO_STATUS_SEEN === "true" || config.AUTO_STATUS_SEEN === true) {
                await test.readMessages([mek.key]);
            }
            if (config.AUTO_STATUS_REACT === "true" || config.AUTO_STATUS_REACT === true) {
                const statusEmojis = ['❤️', '🔥', '💯', '✨', '💎'];
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await test.sendMessage(mek.key.participant, { react: { text: randomEmoji, key: mek.key } }, { statusForward: true });
            }
        }

        // Command logic
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type == 'imageMessage') ? mek.message.imageMessage.caption :
                     (type == 'videoMessage') ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const sender = mek.key.fromMe ? test.user.id : (mek.key.participant || mek.key.remoteJid);
        const isGroup = from.endsWith('@g.us');
        const pushname = mek.pushName || 'User';
        const botNumber2 = await jidNormalizedUser(test.user.id);
        const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

        if (isCmd) {
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    cmd.function(test, mek, sms(test, mek), {
                        from, body, isCmd, command: commandName, args, q, isGroup, sender, pushname, botNumber2, reply
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

// Startup
ensureSessionFile();

// Express Server
app.get("/", (req, res) => { res.send("Oshi MD Multiple Sessions Active ✅"); });
app.listen(port, () => console.log(`Server started on port ${port}`));
