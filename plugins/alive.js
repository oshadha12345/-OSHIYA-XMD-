const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "alive",
    react: "✨",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const from = mek.key.remoteJid;

      await malvin.sendPresenceUpdate("recording", from);

      const aliveMessage = `
╭━━━〔 *OSHIYA MD* 〕━━━⬣
┃ 🤖 Status : *ONLINE & ACTIVE*
┃ ⚡ Speed  : *Fast Response*
┃ 🔥 Mode   : *${config.MODE.toUpperCase()}*
┃ 💎 Version: *V1*
╰━━━━━━━━━━━━━━━━━━⬣

🌐 *Official WhatsApp Channel*  
Follow & Stay Updated 🔔

📂 *GitHub Repository*  
https://github.com/oshadha12345/-OSHIYA-XMD-/tree/main

👑 *Owner*  
https://t.me/devmalvin

⚠️ *Disclaimer*  
We are not responsible for any WhatsApp bans  
that may occur due to bot usage.  
Use at your own risk.
`;

      await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg",
          },
          caption: aliveMessage,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
  }
);