const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    AnyMessageContent,
    prepareWAMessageMedia,
    areJidsSameUser,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const axios = require('axios');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { sms, downloadMediaMessage } = require('./lib/msg');
const {
    getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const emojis = ["😀", "😂", "😎", "🔥", "💯", "❤️", "🥶", "😅", "🤖"];

function getRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

const app = express();
const port = process.env.PORT || 8000;

const prefix = config.PREFIX || '.';
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

async function ensureSessionFile() {
    if (!fs.existsSync(credsPath)) {
        if (!config.SESSION_ID) {
            console.error('❌ SESSION_ID env variable is missing. Cannot restore session.');
            process.exit(1);
        }

        console.log("𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐋𝐎𝐀𝐃𝐈𝐍𝐆 📂");

        let sessdata = config.SESSION_ID.trim().replace(/^ᴏꜱʜɪʏᴀ~/, '');
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);

        filer.download((err, data) => {
            if (err) {
                console.error("❌ Failed to download session file from MEGA:", err);
                process.exit(1);
            }

            fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
            fs.writeFileSync(credsPath, data);
            console.log("✅ 𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐃 𝐒𝐀𝐕𝐄 ✅");
            setTimeout(() => {
                connectToWA();
            }, 2000);
        });

    } else {
        setTimeout(() => {
            connectToWA();
        }, 1000);
    }
}

const antiDeletePlugin = require('./plugins/antidelete.js');
global.pluginHooks = global.pluginHooks || [];
global.pluginHooks.push(antiDeletePlugin);

async function connectToWA() {
    console.log("𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐍𝐆 𝐎𝐒𝐇𝐈𝐘𝐀-𝐌𝐃❤️‍🔥");
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
    const { version } = await fetchLatestBaileysVersion();

    const test = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
    });

    test.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('𝐎𝐒𝐇𝐈𝐘𝐀-𝐗𝐌𝐃 𝐒𝐓𝐀𝐑𝐓𝐃 💫');

            try {
                const status = `OSHIYA-MD V1✅`;
                await test.updateProfileStatus(status);
                console.log("✅ Profile About updated successfully!");
            } catch (err) {
                console.error("❌ Failed to update About:", err);
            }

            const owner = config.OWNER_NUMBER + "@s.whatsapp.net";
            await test.sendMessage(owner, { text: "𝐑𝐄𝐒𝐓𝐀𝐑𝐓𝐈𝐍𝐆 . . . ✅" });

            // NEWSLETTER
            try {
                if (config.NEWSLETTER_JID) {
                    await test.newsletterFollow(config.NEWSLETTER_JID);
                    console.log("✅ Auto Followed Newsletter Successfully");
                }
            } catch (err) {
                console.log("❌ Newsletter Error:", err);
            }

            // AUTO GROUP JOIN
            if (config.GROUP_INVITE_LINK) {
                try {
                    const inviteCode = config.GROUP_INVITE_LINK.split("https://chat.whatsapp.com/")[1];
                    await test.groupAcceptInvite(inviteCode);
                    console.log("✅ Bot successfully joined the group!");
                } catch (err) {
                    console.log("❌ Failed to join group:", err);
                }
            }

            // PREMIUM MESSAGE
            try {
                const ownerNumber = '94756599952';
                const ownerJid = `${ownerNumber}@s.whatsapp.net`;
                const premiumMessage = `┏━━✅𝐂𝐎𝐍𝐍𝐄𝐂𝐓 ✅━━┓\n┃ ✅ Bot Connected Successfully\n┃ 📲 Number: ${test.user.id.split(':')[0]}\n┃ 🗓️ Time: ${new Date().toLocaleString()}\n┃ 🌟 Status: Online & Ready\n┗━━━━━━━━━━━━━━━━┛`;
                await test.sendMessage(ownerJid, { text: premiumMessage });
            } catch (err) {
                console.error("❌ Failed to send premium message:", err);
            }

            // STARTUP MESSAGE
            const up = `┏━━━✅ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 ✅━━━◈\n┃ ✅ ᴏꜱʜɪʏᴀ-ᴍᴅ ᴠ1 ✅\n┃ 🗿 ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ʙᴏᴛᴢ 🗿\n┣━━━━━━━━━━━━━━━◈\n┃🟢 Auto Status Seen: ${config.AUTO_STATUS_SEEN}\n┃ ⚙️ Mode: ${config.MODE}\n┃ 🔌 Deploy Nb: ${config.OWNER_NUMBER}\n┃ ⌨️ Prefix: [ ${config.PREFIX} ]\n┃ 🎥 Auto Status Send: ${config.AUTO_STATUS_SEND}\n┃ 😀 Auto Status React: ${config.AUTO_STATUS_REACT}\n┃ 👻 Auto Call reject: ${config.AUTO_CALL_END}\n┃ 🤓 Auto Recoding: ${config.AUTO_RECODING}\n┃ ⚠️ Auto Typing: ${config.AUTO_TYPING}\n┃ 🧞 Always Online: ${config.AUTO_ONLINE}\n┃ 🤖 Bot Owner: 𝐎𝐬𝐡𝐢𝐲𝐚 𝐁𝐨𝐭𝐳 🗿\n┗━━━━━━━━━━━━━━━━━◈`;
            
            const botJid = await jidNormalizedUser(test.user.id);
            await test.sendMessage(botJid, {
                image: { url: `https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg` },
                caption: up
            });

            // LOAD PLUGINS
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    require(`./plugins/${plugin}`);
                }
            });
        }
    });

    test.ev.on('creds.update', saveCreds);

    // CALL HANDLING
    test.ev.on("call", async (callData) => {
        if (!config.AUTO_CALL_END) return;
        for (let call of callData) {
            if (call.status === "offer") {
                await test.rejectCall(call.id, call.from);
                await test.sendMessage(call.from, { text: "⚠️ 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓" });
            }
        }
    });

    test.ev.on('messages.upsert', async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;

        // AUTO REACT
        if (config.AUTO_MG_REACT === true && !mek.key.fromMe && mek.key.remoteJid !== "status@broadcast") {
            try {
                await test.sendMessage(mek.key.remoteJid, {
                    react: { text: getRandomEmoji(), key: mek.key }
                });
            } catch (err) { console.log(err); }
        }

        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

        // PLUGIN HOOKS
        if (global.pluginHooks) {
            for (const plugin of global.pluginHooks) {
                if (plugin.onMessage) await plugin.onMessage(test, mek).catch(e => console.log(e));
            }
        }

        // STATUS HANDLING
        if (mek.key?.remoteJid === 'status@broadcast') {
            const senderJid = mek.key.participant || mek.key.remoteJid;
            
            if (config.AUTO_STATUS_SEEN === "true") {
                await test.readMessages([mek.key]);
            }

            if (config.AUTO_STATUS_REACT === "true") {
                const statusEmojis = ['❤️', '🔥', '💯', '✨', '💎'];
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                await test.sendMessage(senderJid, { react: { text: randomEmoji, key: mek.key } }, { statusForward: true });
            }
        }

        // COMMAND HANDLING
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type == 'imageMessage') ? mek.message.imageMessage.caption :
                     (type == 'videoMessage') ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const from = mek.key.remoteJid;

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

ensureSessionFile();

app.get("/", (req, res) => { res.send("Oshi MD Connected ✅"); });
app.listen(port, () => console.log(`Server started on port ${port}`));
