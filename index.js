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
                PREFIX: config.PREFIX || '.' 
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

// --- Infinite Loop for MEGA (Real-time tracking) ---
async function continuousWatch() {
    await watchMegaSessions();
    // තත්පර 5 කින් නැවත පරීක්ෂා කරයි (මෙය RAM එකට පහසුයි)
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
        const from = mek.key.remoteJid;
        
        vaScript

// --- main.js ඇතුළත messages.upsert event එක තුළ මෙම කොටස එක් කරන්න ---

test.ev.on('messages.upsert', async ({ messages }) => {
    const mek = messages[0];
    if (!mek || !mek.message) return;
    const from = mek.key.remoteJid;
    
    // මෙසේජ් එකේ අන්තර්ගතය ලබා ගැනීම
    const type = getContentType(mek.message);
    const body = (type === 'conversation') ? mek.message.conversation :
                 (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                 (type === 'imageMessage') ? mek.message.imageMessage.caption :
                 (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

    // Prefix එක නැතිව වැඩ කරන "oshiya" command එක
    if (body.toLowerCase() === 'oshiya') {
        const vcard = 'BEGIN:VCARD\n' // vcard format එක ආරම්භය
            + 'VERSION:3.0\n' 
            + 'FN:OSHIYA\n' // මෙතනට නම දාන්න
            + 'ORG:OSHIYA-MD;\n' 
            + 'TEL;type=CELL;type=VOICE;waid=94756599952:+94 75 659 9952\n' // දුරකථන අංකය
            + 'END:VCARD';

        await test.sendMessage(from, { 
            contacts: { 
                displayName: 'OSHIYA', 
                contacts: [{ vcard }] 
            }
        }, { quoted: mek });
        
        // කැමතිනම් reaction එකක් දාන්න පුළුවන්
        await test.sendMessage(from, { react: { text: "👤", key: mek.key } });
    }
    
        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

        const currentSett = await getDBSettings();
        const dbPrefix = currentSett.PREFIX || '.';
        const workType = currentSett.WORK_TYPE || 'public';

        if (currentSett.AUTO_TYPING && !mek.key.fromMe) {
            await test.sendPresenceUpdate('composing', from);
        }

        if (currentSett.AUTO_MG_REACT && !mek.key.fromMe && from !== "status@broadcast") {
            try { await test.sendMessage(from, { react: { text: getLocalRandomEmoji(), key: mek.key } }); } catch (err) {}
        }

        if (from === 'status@broadcast') {
            if (currentSett.AUTO_STATUS_SEEN) await test.readMessages([mek.key]);
            if (currentSett.AUTO_STATUS_REACT) {
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

        const isCmd = body.startsWith(dbPrefix);
        const commandName = isCmd ? body.slice(dbPrefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const botNumber2 = jidNormalizedUser(test.user.id);
        const sender = mek.key.fromMe ? botNumber2 : (mek.key.participant || mek.key.remoteJid);
        const isOwner = mek.key.fromMe || config.OWNER_NUMBER.includes(sender.split('@')[0]);
        const isGroup = from.endsWith('@g.us');
        const pushname = mek.pushName || 'User';
        const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

        if (isCmd) {
            if (workType === 'private' && !isInbox) return;
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    cmd.function(test, mek, sms(test, mek), {
                        from, body, isCmd, command: commandName, args, q, isGroup, sender, pushname, botNumber2, isInbox, reply
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

// --- Start the App ---
continuousWatch();

app.get("/", (req, res) => { 
    res.send(`OSHIYA-MD is running. Active Sessions: ${activeSessions.size}`); 
});

app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
