const { cmd } = require("../command");
const config = require('../config');
const { sendButtons } = require('gifted-btns'); // gifted-btns npm එක භාවිතා කිරීම

cmd(
  {
    pattern: "alive",
    react: "✅",
    desc: "Show bot status with UI buttons",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { from, pushname }) => {
    try {
      await malvin.sendPresenceUpdate("recording", from);

      const prefix = config.PREFIX || '.';

      // Premium Alive Message Design
      const aliveBody = `┏━━━━━━━━━━━━━━━━━━━━┓
┃   👑 *OSHIYA MD V1 STATUS* 👑
┗━━━━━━━━━━━━━━━━━━━━┛
┃ 🤖 *Status:* Online & Active
┃ ⚡ *Speed:* Fast Response
┃ 🔥 *Mode:* ${config.MODE.toUpperCase()}
┃ 💎 *Version:* V1.0.4
┃ 👤 *User:* ${pushname || 'User'}
┗━━━━━━━━━━━━━━━━━━━━┛

> *Powered by Oshadha*`;

      // gifted-btns හරහා බොත්තම් සහිත පණිවිඩය යැවීම
      await sendButtons(malvin, from, {
        text: aliveBody,
        footer: '© 2026 OSHIYA-MD V1',
        image: { url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg" },
        aimode: true, // AI features සක්‍රීය කිරීමට
        buttons: [
          {
            id: `${prefix}menu`, 
            text: '📜 MAIN MENU' 
          },
          {
            id: `${prefix}ping`, 
            text: '📡 PING BOT' 
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📢 OFFICIAL CHANNEL',
              url: 'https://whatsapp.com/channel/your-link'
            })
          }
        ]
      }, { quoted: mek });

    } catch (e) {
      console.error("❌ Error in .alive button command:", e);
      // බොත්තම් වැඩ නොකළහොත් සාමාන්‍ය මැසේජ් එකක් යැවීම
      await malvin.sendMessage(from, { text: "❌ Button System Error!" }, { quoted: mek });
    }
  }
);
