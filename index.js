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

// දැනට ක්‍රියාත්මක වන සෙෂන් මතක තබා ගැනීමට
const activeSessions = new Set();

const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];
function getLocalRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * MEGA ගිණුම පරීක්ෂා කර අලුත් සෙෂන් තිබේ නම් ඒවා සම්බන්ධ කිරීම
 */
async function watchMegaSessions() {
    try {
        console.log("🔍 CHECKING MEGA FOR NEW SESSIONS...");
        
        const storage = await new Storage({
            email: "oshiya444@gmail.com",
            password: "!kvs95v9xHUnaDW"
        }).ready;

        const files = storage.root.children;
        // .json ගොනු පමණක් ලබා ගැනීම
        const credFiles = files.filter(f => f.name.endsWith('.json'));

        if (credFiles.length === 0) {
            console.log('ℹ️ No creds.json files found in MEGA.');
            return;
        }

        for (let file of credFiles) {
            // දැනටමත් මෙම ෆයිල් එකෙන් බොට් කෙනෙක් රන් වෙනවා නම් මගහරින්න
            if (activeSessions.has(file.name)) continue;

            console.log(`✨ New session detected: [${file.name}]`);
            
            // සෙෂන් එකට අද්විතීය නමක් ලබා දීම (ෆයිල් එකේ නම පදනම් කරගෙන)
            const sessionName = file.name.replace('.json', '');
            const folderPath = path.join(__dirname, `/auth_info_baileys/${sessionName}/`);
            const credsFile = path.join(folderPath, 'creds.json');

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // MEGA එකෙන් බාගත කර සේව් කිරීම
            const data = await file.downloadBuffer();
            fs.writeFileSync(credsFile, data);
            
            // සෙෂන් එක active ලෙස ලකුණු කිරීම
            activeSessions.add(file.name);
            
            // බොට් සම්බන්ධ කිරීම
            connectToWA(folderPath, sessionName, file.name);
        }

    } catch (err) {
        console.error("❌ MEGA Watcher Error:", err);
    }
}

/**
 * WhatsApp සම්බන්ධතාවය ගොඩනැගීම
 */
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
        generateHighQualityLinkPreview: true,
    });

    test.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWA(authPath, sessionLabel, originalFileName);
            } else {
                console.log(`🔴 Session [${sessionLabel}] logged out. Removing...`);
                activeSessions.delete(originalFileName);
            }
        } else if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD [${sessionLabel}] CONNECTED 💫`);

            try { await test.updateProfileStatus(`OSHIYA-MD Active ✅`); } catch (e) {}

            const owner = config.OWNER_NUMBER + "@s.whatsapp.net";
            await test.sendMessage(owner, { text: `🚀 OSHIYA-MD IS NOW ONLINE!` });

            // Plugins Load කිරීම
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

    // Call Handling
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

    // Message Handling
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

// --- STARTUP LOGIC ---

// 1. මුලින්ම MEGA එක පරීක්ෂා කරන්න
watchMegaSessions();

// 2. සෑම විනාඩි 5 කට වරක් ස්වයංක්‍රීයව අලුත් ෆයිල් තිබේදැයි බලන්න (300,000ms = 5 mins)
setInterval(() => {
    watchMegaSessions();
}, 60000);

// Express Server
app.get("/", (req, res) => { 
    res.send(`Oshi MD Active Sessions: ${activeSessions.size} ✅`); 
});

app.listen(port, () => console.log(`Server started on port ${port}`));
