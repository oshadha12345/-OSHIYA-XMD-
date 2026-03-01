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
  generateMessageID, makeInMemoryStore,
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
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94725364886'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

const log = (...args) => console.log('[DEBUG]', ...args);

// ================= SESSION FILE HANDLING =================
async function ensureSessionFile() {
  log('Checking session file...');
  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.error('❌ SESSION_ID missing. Cannot restore session.');
      process.exit(1);
    }
    log('Downloading session file from MEGA...');
    let sessdata = config.SESSION_ID.trim().replace(/^ᴏꜱʜɪʏᴀ~/, '');
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
      if (err) {
        console.error('❌ Failed to download session file:', err);
        process.exit(1);
      }
      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);
      log('✅ Session file saved.');
      setTimeout(() => { connectToWA(); }, 2000);
    });
  } else {
    log('Session file exists, connecting to WhatsApp...');
    setTimeout(() => { connectToWA(); }, 1000);
  }
}

// ================= PLUGIN HOOKS =================
const antiDeletePlugin = require('./plugins/antidelete.js');
global.pluginHooks = global.pluginHooks || [];
global.pluginHooks.push(antiDeletePlugin);

// ================= CONNECT TO WHATSAPP =================
async function connectToWA() {
  log('Connecting to WhatsApp...');
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
  const { version } = await fetchLatestBaileysVersion();
  log('Using Baileys version:', version);

  const sock = makeWASocket({
    logger: P({ level: 'debug' }),
    printQRInTerminal: true,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  });

  // ================= CONNECTION EVENTS =================
  sock.ev.on('connection.update', async (update) => {
    log('Connection update:', update);
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      log('Connection closed:', lastDisconnect?.error);
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        log('Reconnecting...');
        connectToWA();
      } else {
        log('Logged out from WhatsApp, session reset required.');
      }
    } else if (connection === 'open') {
      log('✅ WhatsApp connected.');

      try {
        await sock.updateProfileStatus("OSHIYA-MD");
        log('✅ About/Bio updated.');
      } catch (err) {
        console.log('❌ Failed to update About:', err);
      }

      const up = `test-MD connected ✅\n\nPREFIX: ${prefix}`;
      await sock.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: `https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg` },
        caption: up
      });

      // Load all plugins
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require(`./plugins/${plugin}`);
          log(`Plugin loaded: ${plugin}`);
        }
      });
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ================= MESSAGE EVENTS =================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    log('New messages:', messages.length);
    const mek = messages[0];
    if (!mek || !mek.message) return;
    mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

    // Plugins onMessage
    if (global.pluginHooks) {
      for (const plugin of global.pluginHooks) {
        if (plugin.onMessage) {
          try {
            await plugin.onMessage(sock, mek);
          } catch (e) {
            console.log('onMessage plugin error:', e);
          }
        }
      }
    }

    // ================= STATUS EVENTS =================
    if (mek.key?.remoteJid === 'status@broadcast') {
      const senderJid = mek.key.participant || mek.key.remoteJid || "unknown@s.whatsapp.net";
      const mentionJid = senderJid.includes("@s.whatsapp.net") ? senderJid : senderJid + "@s.whatsapp.net";

      if (config.AUTO_STATUS_SEEN === "true") {
        try {
          await sock.readMessages([mek.key]);
          log(`[✓] Status seen: ${mek.key.id}`);
        } catch (e) {
          console.error('❌ Failed to mark status as seen:', e);
        }
      }

      if (config.AUTO_STATUS_REACT === "true" && mek.key.participant) {
        try {
          const emojis = ['❤️','💸','😇','🍂','💥','💯','🔥','💫','💎','💗','🤍','🖤','👀','🙌','🙆','🚩','🥰','💐','😎','🤎','✅','🫀','🧡','😁','😄','🌸','🕊️','🌷','⛅','🌟','🗿','💜','💙','🌝','🖤','💚'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await sock.sendMessage(mek.key.participant, { react: { text: randomEmoji, key: mek.key } });
          log(`[✓] Reacted to status of ${mek.key.participant} with ${randomEmoji}`);
        } catch (e) {
          console.error('❌ Failed to react to status:', e);
        }
      }
    }

    // ================= COMMAND HANDLING =================
    const m = sms(sock, mek);
    const type = getContentType(mek.message);
    const body = (type === 'conversation') ? mek.message.conversation :
      (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
      (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
      (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption : '';
    const isCmd = body.startsWith(prefix);
    const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe ? sock.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = mek.key.remoteJid.endsWith('@g.us');
    const botNumber2 = await jidNormalizedUser(sock.user.id);

    const reply = (text) => sock.sendMessage(mek.key.remoteJid, { text }, { quoted: mek });

    if (isCmd) {
      const cmd = commands.find(c => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
      if (cmd) {
        if (cmd.react) sock.sendMessage(mek.key.remoteJid, { react: { text: cmd.react, key: mek.key } });
        try {
          cmd.function(sock, mek, m, { from: mek.key.remoteJid, quoted: mek, body, isCmd, command: commandName, args, q, reply });
        } catch (e) {
          console.error("[PLUGIN ERROR]", e);
        }
      }
    }

    // Reply Handlers
    for (const handler of replyHandlers) {
      if (handler.filter(body, { sender, message: mek })) {
        try {
          await handler.function(sock, mek, m, { from: mek.key.remoteJid, quoted: mek, body, sender, reply });
          break;
        } catch (e) {
          console.error('Reply handler error:', e);
        }
      }
    }
  });

  // ================= MESSAGE DELETE EVENTS =================
  sock.ev.on('messages.update', async (updates) => {
    if (global.pluginHooks) {
      for (const plugin of global.pluginHooks) {
        if (plugin.onDelete) {
          try {
            await plugin.onDelete(sock, updates);
          } catch (e) {
            console.log("onDelete plugin error:", e);
          }
        }
      }
    }
  });
}

// ================= START SESSION =================
ensureSessionFile();

// ================= EXPRESS SERVER =================
app.get("/", (req, res) => {
  log("HTTP / endpoint accessed");
  res.send("OSHIYA-MD Bot running, debug mode ON.");
});

app.listen(port, () => log(`Server running on port ${port}`));
