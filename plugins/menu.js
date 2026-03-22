const { cmd, commands } = require("../command");
const config = require('../config');
const moment = require("moment-timezone");

// ================= STATE =================
const pendingMenu = {}; // මෙහි sender සහ මෙනු එකේ msgId එක store වේ.

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
    await test.sendMessage(from, { react: { text: "🌸", key: m.key } });

    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

    const commandMap = {};
    for (const command of commands) {
      if (command.dontAddCommandList) continue;
      const category = (command.category || "MISC").toUpperCase();
      if (!commandMap[category]) commandMap[category] = [];
      commandMap[category].push(command);
    }

    const categories = Object.keys(commandMap);

    // Voice Send
    await test.sendMessage(from, { audio: { url: autoVoice }, mimetype: "audio/mp4", ptt: false });

    let menuText = `╔═══━━━─ • ─━━━═══╗\n👑  ${toFancy(botName)}  👑\n╚═══━━━─ • ─━━━═══╝\n\n`;
    menuText += `╭━━━〔 🧬 ɪɴꜰᴏ 〕━━━╮\n┃ 👑 ᴏᴡɴᴇʀ    : ${ownerName}\n┃ 👤 ᴜꜱᴇʀ     : ${pushname}\n┃ 📅 ᴅᴀᴛᴇ     : ${date}\n┃ ⏰ ᴛɪᴍᴇ     : ${time}\n┃ ⚙️ ᴘʀᴇꜰɪx   : ${prefix}\n╰━━━━━━━━━━━━━━━━━━╯\n\n`;
    menuText += `╭━━〔✧ ᴄᴀᴛᴇɢᴏʀɪᴇꜱ ✧〕━━╮\n`;
    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${toFancy(cat)} 〔 ${commandMap[cat].length} 〕\n`;
    });
    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n🌷 > ʀᴇᴘʟʏ ᴡɪᴛʜ ᴄᴀᴛᴇɢᴏʀʏ ɴᴜᴍʙᴇʀ`;

    // මෙනු පණිවිඩය යවා එහි ID එක ලබා ගැනීම
    const sentMsg = await test.sendMessage(from, { image: { url: headerImage }, caption: menuText }, { quoted: m });

    // State එකේ msgId එක සේව් කිරීම
    pendingMenu[sender] = { 
        step: "category", 
        commandMap, 
        categories, 
        msgId: sentMsg.key.id 
    };

    setTimeout(() => { delete pendingMenu[sender]; }, 2 * 60 * 1000);

  } catch (err) {
    console.error(err);
  }
});

// ========================
// ===== REPLY SELECT =====
// ========================
// මෙහිදී cmd function එක වෙනුවට "on: body" භාවිතා කර Reply පරීක්ෂා කරයි
cmd({
  on: "body"
}, async (test, m, msg, { from, body, sender }) => {
  try {
    const input = body.trim();
    const pending = pendingMenu[sender];

    // පරීක්ෂාව: State එකේ ඉන්නවද? අංකයක්ද? ඒ වගේම Reply එකක්ද?
    if (pending && pending.step === "category" && /^[0-9]+$/.test(input)) {
        
        // Reply කළ මැසේජ් එකේ ID එක (stanzaId) ලබා ගැනීම
        const quotedMsgId = m.msg.contextInfo ? m.msg.contextInfo.stanzaId : null;

        // Reply කළ මැසේජ් එක අපේ මෙනු එකේ ID එකට සමාන නම් පමණක් ක්‍රියාත්මක වේ
        if (quotedMsgId === pending.msgId) {
            
            const index = parseInt(input) - 1;
            const { commandMap, categories } = pending;

            if (index >= 0 && index < categories.length) {
                await test.sendMessage(from, { react: { text: "📂", key: m.key } });

                const selectedCategory = categories[index];
                const cmds = commandMap[selectedCategory];

                let cmdText = `╭━───❰ ${toFancy(selectedCategory)} ❱───━╮\n`;
                cmds.forEach((c, i) => {
                    cmdText += `\n╭─❍ ${i + 1}\n│ ✧ ᴄᴏᴍᴍᴀɴᴅ : ${prefix}${c.pattern}\n│ ✧ ɪɴꜰᴏ    : ${c.desc || "No description"}\n╰───────────────❍\n`;
                });

                await test.sendMessage(from, {
                    image: { url: headerImage },
                    caption: cmdText
                }, { quoted: m });
            }
        }
    }
  } catch (err) {
    console.error(err);
  }
});
