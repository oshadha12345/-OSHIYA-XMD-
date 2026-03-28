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

// --- Helper: MongoDB එකෙන් Settings කියවීමට ---
async function getDBSettings() {
    try {
        let settings = await Settings.findOne({ id: 'main_settings' });
        if (!settings) {
            // Default අගයන් සමඟ මුලින්ම සෑදීම
            settings = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false, 
                AUTO_MG_REACT: false, 
                AUTO_STATUS_SEEN: false, 
                AUTO_STATUS_REACT: false,
                WORK_TYPE: 'public', // Default Public
                PREFIX: config.PREFIX || '.' // Default Prefix
            });
        }
        return settings;
    } catch (e) {
        console.error("Error fetching settings:", e);
        return { WORK_TYPE: 'public', PREFIX: '.' };
    }
}

const activeSessions = new Set();
async function watchMegaSessions() { /* ඔබේ පැරණි කේතය මෙතැනට ... */ }

async function connectToWA(authPath, sessionLabel, originalFileName) {
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
        if (connection === 'open') {
            console.log(`✅ OSHIYA-XMD CONNECTED`);
            // Plugins load කිරීම
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

    test.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;
        const from = mek.key.remoteJid;
        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

        // DB එකෙන් Settings ලබා ගැනීම
        const currentSett = await getDBSettings();
        const customPrefix = currentSett.PREFIX || '.';
        
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type == 'imageMessage') ? mek.message.imageMessage.caption :
                     (type == 'videoMessage') ? mek.message.videoMessage.caption : '';

        // Prefix එක පරීක්ෂා කිරීම
        const isCmd = body.startsWith(customPrefix);
        const commandName = isCmd ? body.slice(customPrefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const sender = mek.key.fromMe ? test.user.id : (mek.key.participant || mek.key.remoteJid);
        const isOwner = config.OWNER_NUMBER.includes(sender.split('@')[0]) || mek.key.fromMe;
        const reply = (text) => test.sendMessage(from, { text }, { quoted: mek });

        // --- WORK TYPE LOGIC ---
        // පණිවිඩය Command එකක් නම් සහ Mode එක Private නම්, Owner ට හැර අන් අයට වැඩ නොකරයි
        if (isCmd && currentSett.WORK_TYPE === 'private' && !isOwner) return;

        if (isCmd) {
            const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
            if (cmd) {
                if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                try {
                    cmd.function(test, mek, sms(test, mek), {
                        from, body, isCmd, command: commandName, args, q, isOwner, reply, 
                        botNumber2: await jidNormalizedUser(test.user.id), pushname: mek.pushName || 'User'
                    });
                } catch (e) { console.error(e); }
            }
        }
    });
}

watchMegaSessions();
setInterval(() => watchMegaSessions(), 30000);
app.listen(port);
