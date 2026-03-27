const { cmd, commands } = require("../command");
const config = require('../config');
const moment = require("moment-timezone");

// ================= STATE =================
// මෙනු එකේ state එක තාවකාලිකව තබා ගැනීමට
const pendingMenu = {};

// ================= CONFIG =================
const botName = "𝐎𝐒𝐇𝐈𝐘𝐀 𝐌𝐃 𝐕1";
const ownerName = "𝐎𝐬𝐡𝐚𝐝𝐡𝐚 💗";
const prefix = config.PREFIX || '.';  

const headerImage = "https://files.catbox.moe/imxhbb.png";

// 🔊 Voice direct mp3 link
const autoVoice = "https://github.com/oshadha12345/images/raw/refs/heads/main/Voice/Parano%20(Tiktok%20Version)%20-%20Frozy%20Ft.%20DDB%20%5BEdit%20Audio%5D(MP3_160K).mp3";
// ==========================================


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
}, async (conn, m, msg, { from, sender, pushname }) => {

  try {
    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

    if (!commands || !Array.isArray(commands) || commands.length === 0) {
      return conn.sendMessage(from, { text: "❌ No commands found!" });
    }

    // Organize commands by category
    const commandMap = {};
    commands.forEach((command) => {
      if (command.dontAddCommandList || !command.pattern) return;
      const category = (command.category || "MISC").toUpperCase();
      if (!commandMap[category]) commandMap[category] = [];
      commandMap[category].push(command);
    });

    const categories = Object.keys(commandMap).sort();
    
    // ===== AUTO VOICE SEND =====
    await conn.sendMessage(from, {
      audio: { url: autoVoice },
      mimetype: "audio/mp4",
      ptt: true // true දැමීමෙන් voice note එකක් ලෙස යයි
    }, { quoted: m });

    // ===== BUILD MENU TEXT =====
    let menuText = `╔═══━━━─ • ─━━━═══╗
   👑  ${toFancy(botName)}  👑
╚═══━━━─ • ─━━━═══╝

╭━━━〔 🧬 ɪɴꜰᴏ 〕━━━╮
┃ 👑 ᴏᴡɴᴇʀ   : ${ownerName}
┃ 👤 ᴜꜱᴇʀ    : ${pushname}
┃ 📅 ᴅᴀᴛᴇ    : ${date}
┃ ⏰ ᴛɪᴍᴇ    : ${time}
┃ ⚙️ ᴘʀᴇꜰɪx  : ${prefix}
╰━━━━━━━━━━━━━━━━━━╯

╭━━〔✧ ᴄᴀᴛᴇɢᴏʀɪᴇꜱ ✧〕━━╮
`;

    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${toFancy(cat)} 〔 ${commandMap[cat].length} 〕\n`;
    });

    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n`;
    menuText += `\n🌷 *Reply with a category number to see commands.*`;

    // ===== SEND MENU =====
    const sentMsg = await conn.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // ===== SAVE STATE FOR REPLY =====
    // මෙතනදී sender ගේ ID එක යටතේ categories ටික save කරගන්නවා reply එක check කරන්න
    pendingMenu[from] = { 
        userId: sender, 
        categories: categories, 
        commandMap: commandMap,
        messageId: sentMsg.key.id 
    };

    // විනාඩි 5 කට පසු state එක delete කරන්න
    setTimeout(() => {
      delete pendingMenu[from];
    }, 5 * 60 * 1000);

  } catch (err) {
    console.error("Menu Error:", err);
    await conn.sendMessage(from, { text: "❌ Something went wrong!" });
  }
});


// ==============================
// ===== REPLY HANDLER Logic =====
// ==============================
// මෙතනදී වෙන්නේ ඕනෑම message එකක් ආ විට එය අංකයක්ද සහ කලින් මෙනු එක ඕපන් කරලාද බලන එකයි
cmd({
    on: "body"
}, async (conn, m, msg, { from, body, sender }) => {
    const input = body.trim();
    
    // ඉදිරියෙන් prefix එක තිබේ නම් හෝ අංකයක් නොවේ නම් process කරන්නේ නැත
    if (!pendingMenu[from] || isNaN(input)) return;
    
    const { userId, categories, commandMap } = pendingMenu[from];

    // අංකය අදාළ category පරාසය ඇතුළේ තිබේදැයි බලයි
    const index = parseInt(input) - 1;
    if (index >= 0 && index < categories.length) {
        
        const selectedCategory = categories[index];
        const cmdsInCategory = commandMap[selectedCategory];

        let cmdText = `╭━───❰ ${toFancy(selectedCategory)} ❱───━╮\n`;

        cmdsInCategory.forEach((c, i) => {
          cmdText += `
╭─❍ ${i + 1}
│ ✧ ᴄᴏᴍᴍᴀɴᴅ : ${prefix}${c.pattern}
│ ✧ ɪɴꜰᴏ    : ${c.desc || "No description"}
╰───────────────❍
`;
        });

        cmdText += `\n*🌸 TOTAL COMMANDS: ${cmdsInCategory.length}*`;

        await conn.sendMessage(from, {
          image: { url: headerImage },
          caption: cmdText
        }, { quoted: m });

        // Category එක පෙන්නුවාට පසු state එක clear කරන්න (අවශ්‍ය නම් පමණක්)
        // delete pendingMenu[from];
    }
});
