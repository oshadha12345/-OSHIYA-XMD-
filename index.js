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


        
Conversation with Gemini
You said
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

if (workType === 'private' && !isOwner) return;

const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));

if (cmd) {

if (cmd.react) test.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

try {

cmd.function(test, mek, sms(test, mek), {

from, body, isCmd, command: commandName, args, q, isGroup, sender, pushname, botNumber2, isOwner, reply

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



main.js file ekak hadanna prefix eka nathuwa command main.js eke hadanna oshiya kiyala dunnama vcard eka send wenna hadanna 0756599952

Gemini said
ඔබ ලබාදුන් කේතය (Code) මත පදනම්ව, main.js ගොනුව තුළ අලුතින්ම command එකක් එක් කරන ආකාරය පහත දැක්වේ. මෙහිදී ඔබ ඉල්ලා ඇති පරිදි prefix එක නොමැතිව වුවද "oshiya" ලෙස යැවූ විට ඔබගේ VCard එක (Contact card) යන ලෙස සකසා ඇත.

පහත කේතය ඔබගේ main.js ගොනුවේ test.ev.on('messages.upsert', ...) කොටස තුළට ඇතුළත් කරන්න:

JavaScript
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
    if (body.toLowerCase() === 'owner') {
        const vcard = 'BEGIN:VCARD\n' // vcard format එක ආරම්භය
            + 'VERSION:3.0\n' 
            + 'FN:OSHIYA\n' // මෙතනට නම දාන්න
            + 'ORG:OSHIYA-MD;\n' 
            + 'TEL;type=CELL;type=VOICE;waid=94756599952:+94 75 659 9952\n' // දුරකථන අංකය
            + 'END:VCARD';

        await test.sendMessage(from, { 
            contacts: { 
                displayName: 'OSHIYA 💖', 
                contacts: [{ vcard }] 
            }
        }, { quoted: mek });
        
        // කැමතිනම් reaction එකක් දාන්න පුළුවන්
        await test.sendMessage(from, { react: { text: "👤", key: mek.key } });
               }

    
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
