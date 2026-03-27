const { cmd } = require("../command");
const config = require('../config');
const { sendButtons } = require('gifted-btns'); 

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

      // Button Message එක යැවීම
      await sendButtons(malvin, from, {
        text: aliveBody,
        footer: '© 2026 OSHIYA-MD V1',
        image: { url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg" },
        aimode: false,
        buttons: [
          {
            id: `${prefix}menu`, 
            text: '📜  MENU' 
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

      // ==========================================
      // බොත්තම් වැඩ කිරීමට අවශ්‍ය Handler කොටස
      // ==========================================
      malvin.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // බොත්තම එබූ විට ලැබෙන ID එක ලබා ගැනීම
        const selection = msg.message.buttonsResponseMessage?.selectedButtonId || 
                          msg.message.templateButtonReplyMessage?.selectedId ||
                          (msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson 
                           ? JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id 
                           : null);

        if (selection) {
          // බොත්තමේ ID එක (විධානය) සාමාන්‍ය message එකක් ලෙස පද්ධතියට ලබා දීම
          const messageContent = selection.trim();
          
          // පද්ධතියට විධානය යොමු කිරීම සඳහා අවශ්‍ය වෙනස්කම්
          msg.message.conversation = messageContent; 
          
          // මෙහිදී බොට්ගේ handler එක ස්වයංක්‍රීයව අදාළ විධානය (.menu හෝ .ping) ක්‍රියාත්මක කරනු ඇත.
        }
      });

    } catch (e) {
      console.error("❌ Alive Button Error:", e);
      await malvin.sendMessage(from, { text: "❌ Button System Error! Please check your bot's button support." }, { quoted: mek });
    }
  }
);
