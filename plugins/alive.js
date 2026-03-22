const { cmd } = require("../command");
const config = require('../config');

cmd(
  {
    pattern: "alive",
    react: "✨",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply, from }) => {
    try {
      await malvin.sendPresenceUpdate("recording", from);

      const aliveMessage = `
╭━━━〔 *OSHIYA MD* 〕━━━⬣
┃ 🤖 Status : *ONLINE & ACTIVE*
┃ ⚡ Speed  : *Fast Response*
┃ 🔥 Mode   : *${config.MODE.toUpperCase()}*
┃ 💎 Version: *V1*
╰━━━━━━━━━━━━━━━━━━⬣

1️⃣ *Reply with '1' to see Menu*

🌐 *Official WhatsApp Channel* Follow & Stay Updated 🔔

📂 *GitHub Repository* https://github.com/oshadha12345/-OSHIYA-XMD-/tree/main

👑 *Owner* 0756599952

⚠️ *Disclaimer* We are not responsible for any WhatsApp bans  
that may occur due to bot usage.  
Use at your own risk.
`;

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
        if (!newMsg.message) return;
        
        const messageType = Object.keys(newMsg.message)[0];
        const msgContent = (messageType === 'conversation') ? newMsg.message.conversation : (messageType === 'extendedTextMessage') ? newMsg.message.extendedTextMessage.text : '';

        // යැවූ මැසේජ් එකට '1' කියලා reply කරොත් විතරක් ක්‍රියාත්මක වේ
        const isReplyToAlive = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id;

        if (isReplyToAlive && msgContent === '1') {
            await malvin.sendMessage(from, { text: '.menu' }, { quoted: newMsg });
        }
      });

    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
  }
);
