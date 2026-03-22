const { cmd, commands } = require("../command");
const config = require('../config');
const moment = require("moment-timezone");

// ================= STATE =================
const pendingMenu = {}; // මෙහි sender සහ msgId දෙකම store කරයි

// ================= CONFIG =================
const botName = "𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐕1";
const ownerName = "𝐎𝐬𝐡𝐚𝐝𝐡𝐚 💗";
const prefix = config.PREFIX || '.';  
const headerImage = "https://files.catbox.moe/imxhbb.png";
const autoVoice = "https://github.com/oshadha12345/images/raw/refs/heads/main/Voice/Parano%20(Tiktok%20Version)%20-%20Frozy%20Ft.%20DDB%20%5BEdit%20Audio%5D(MP3_160K).mp3";

// ===== ᴀʙᴄ SMALL CAPS CONVERTER =====
function toFancy(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy  = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ";
  return text.toUpperCase().split("").map(c => {
    const i = normal.indexOf(c);
    return i !== -1 ? fancy[i] : c;
  }).join("");
}

// ========================
// ===== MAIN MENU =======
// ========================
cmd({
  pattern: "menu",
  react: "🌸",
  desc: "Show command categories",
  category: "main",
  filename: __filename
}, async (test, m, msg, { from, sender, pushname }) => {
  try {
    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

    const commandMap = {};
    commands.forEach(cmd => {
      if (!cmd.dontAddCommandList && cmd.pattern) {
        const category = (cmd.category || "MISC").toUpperCase();
        if (!commandMap[category]) commandMap[category] = [];
        commandMap[category].push(cmd);
      }
    });

    const categories = Object.keys(commandMap);

    await test.sendMessage(from, { audio: { url: autoVoice }, mimetype: "audio/mp4", ptt: false });

    let menuText = `╔═══━━━─ • ─━━━═══╗\n👑  ${toFancy(botName)}  👑\n╚═══━━━─ • ─━━━═══╝\n\n`;
    menuText += `╭━━━〔 🧬 ɪɴꜰᴏ 〕━━━╮\n┃ 👑 ᴏᴡɴᴇʀ    : ${ownerName}\n┃ 👤 ᴜꜱᴇʀ     : ${pushname}\n┃ 📅 ᴅᴀᴛᴇ     : ${date}\n┃ ⏰ ᴛɪᴍᴇ     : ${time}\n┃ ⚙️ ᴘʀᴇꜰɪx   : ${prefix}\n╰━━━━━━━━━━━━━━━━━━╯\n\n`;
    menuText += `╭━━〔✧ ᴄᴀᴛᴇɢᴏʀɪᴇꜱ ✧〕━━╮\n`;
    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${toFancy(cat)} 〔 ${commandMap[cat].length} 〕\n`;
    });
    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n🌷 > ʀᴇᴘʟʏ ᴡɪᴛʜ ᴄᴀᴛᴇɢᴏʀʏ ɴᴜᴍʙᴇʀ`;

    const sentMsg = await test.sendMessage(from, { image: { url: headerImage }, caption: menuText }, { quoted: m });

    // මෙතනදී sender ගේ ID එක සහ යැවූ මැසේජ් එකේ ID එක (stanzaId) සේව් කරගන්නවා
    pendingMenu[sender] = { 
        step: "category", 
        commandMap, 
        categories, 
        msgId: sentMsg.key.id 
    };

    setTimeout(() => { delete pendingMenu[sender]; }, 5 * 60 * 1000);

  } catch (err) {
    console.error(err);
  }
});

// ========================
// ===== REPLY HANDLER =====
// ========================
// මෙම කොටස වෙනම command එකක් ලෙස නොව, ලැබෙන හැම මැසේජ් එකක්ම check කරන ලෙස සැකසීම සුදුසුයි
test.ev.on('messages.upsert', async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const msgText = m.message.conversation || m.message.extendedTextMessage?.text || "";

    // පරීක්ෂා කරනවා මේක reply එකක්ද සහ sender අපේ state එකේ ඉන්නවද කියලා
    if (pendingMenu[sender]) {
        const contextInfo = m.message.extendedTextMessage?.contextInfo;
        const isReplyToMenu = contextInfo?.stanzaId === pendingMenu[sender].msgId;

        if (isReplyToMenu && /^[0-9]+$/.test(msgText.trim())) {
            const index = parseInt(msgText.trim()) - 1;
            const { commandMap, categories } = pendingMenu[sender];

            if (index >= 0 && index < categories.length) {
                const selectedCategory = categories[index];
                const cmds = commandMap[selectedCategory];

                let cmdText = `╭━───❰ ${toFancy(selectedCategory)} ❱───━╮\n`;
                cmds.forEach((c, i) => {
                    cmdText += `\n╭─❍ ${i + 1}\n│ ✧ ᴄᴏᴍᴍᴀɴᴅ : ${prefix}${c.pattern}\n│ ✧ ɪɴꜰᴏ    : ${c.desc || "No info"}\n╰───────────────❍\n`;
                });

                await test.sendMessage(from, { image: { url: headerImage }, caption: cmdText }, { quoted: m });
                
                // Sub-menu එක දැම්මට පස්සේ state එක අයින් කරන්න පුළුවන් (අවශ්‍ය නම් තබා ගන්න)
                // delete pendingMenu[sender]; 
            }
        }
    }
});
