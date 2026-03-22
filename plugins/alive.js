const { cmd } = require("../command");
const config = require('../config');

cmd(
  {
    pattern: "alive",
    react: "✅",
    desc: "Show bot status with interactive options",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply, from }) => {
    try {
      await malvin.sendPresenceUpdate("recording", from);

      // Premium Alive Message Design
      const aliveMessage = `┏━━━━━━━━━━━━━━━━━━━━┓
┃   👑 *OSHIYA MD V1 STATUS* 👑
┗━━━━━━━━━━━━━━━━━━━━┛
┃ 🤖 *Status:* Online & Active
┃ ⚡ *Speed:* Fast Response
┃ 🔥 *Mode:* ${config.MODE.toUpperCase()}
┃ 💎 *Version:* V1.0.4
┃ 👤 *User:* ${m.pushName || 'User'}
┗━━━━━━━━━━━━━━━━━━━━┛

1️⃣  *Main Menu*
2️⃣  *Ping*

🔗 *Official Channel:* https://whatsapp.com/channel/your-link
📂 *GitHub:* https://github.com/oshadha12345/-OSHIYA-XMD-

> *Powered by Oshadha*`;

      // පණිවිඩය යැවීම
      const sentMsg = await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg",
          },
          caption: aliveMessage,
        },
        { quoted: mek }
      );

      // Reply එක Handle කරන කොටස
      malvin.ev.on('messages.upsert', async (msgUpdate) => {
        const newMsg = msgUpdate.messages[0];
        if (!newMsg.message || newMsg.key.fromMe) return;
        
        const messageType = Object.keys(newMsg.message)[0];
        const msgContent = (messageType === 'conversation') 
            ? newMsg.message.conversation 
            : (messageType === 'extendedTextMessage') 
            ? newMsg.message.extendedTextMessage.text 
            : '';

        // අපි යැවූ alive මැසේජ් එකටමද reply කළේ කියා පරීක්ෂා කිරීම (Stanza ID check)
        const contextInfo = newMsg.message.extendedTextMessage?.contextInfo;
        const isReplyToAlive = contextInfo?.stanzaId === sentMsg.key.id;

        if (isReplyToAlive) {
            if (msgContent === '1') {
                // Menu එක යැවීම
                await malvin.sendMessage(from, { text: '.menu' }, { quoted: newMsg });
            } else if (msgContent === '2') {
                // Ping එක යැවීම
                await malvin.sendMessage(from, { text: '.ping' }, { quoted: newMsg });
            }
        }
      });

    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
  }
);
