const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

// ================= STATE =================
const pendingMenu = {};

// ================= CONFIG =================
const botName = "OSHIYA-MD";
const ownerName = "OSHADHA";
const prefix = ".";

const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

// 🔊 Put your voice direct mp3 link here
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
}, async (test, m, msg, { from, sender, pushname }) => {

  try {

    await test.sendMessage(from, { react: { text: "🌸", key: m.key } });

    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss");

    if (!commands || !Array.isArray(commands) || commands.length === 0) {
      return test.sendMessage(from, { text: "❌ No commands found!" });
    }

    // Organize commands by category
    const commandMap = {};
    for (const command of commands) {
      if (command.dontAddCommandList) continue;
      const category = (command.category || "MISC").toUpperCase();
      if (!commandMap[category]) commandMap[category] = [];
      commandMap[category].push(command);
    }

    const categories = Object.keys(commandMap);
    if (categories.length === 0) {
      return test.sendMessage(from, { text: "❌ No categories available!" });
    }

    // ===== AUTO VOICE SEND FIRST =====
    await test.sendMessage(from, {
      audio: { url: autoVoice },
      mimetype: "audio/mp4",
      ptt: false
    });

    // ===== BUILD MENU TEXT =====
    let menuText = `╔═══━━━─ • ─━━━═══╗
   👑  ${toFancy(botName)}  👑
╚═══━━━─ • ─━━━═══╝

╭━━━〔 👤 ɪɴꜰᴏ 〕━━━╮
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
    menuText += `\n🌷 ʀᴇᴘʟʏ ᴡɪᴛʜ ᴄᴀᴛᴇɢᴏʀʏ ɴᴜᴍʙᴇʀ ᴛᴏ ᴇxᴘʟᴏʀᴇ`;

    // ===== SEND MENU AFTER VOICE =====
    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // ===== SAVE STATE =====
    pendingMenu[sender] = { step: "category", commandMap, categories };

    setTimeout(() => {
      delete pendingMenu[sender];
    }, 2 * 60 * 1000);

  } catch (err) {
    console.error("Menu Error:", err);
    await test.sendMessage(from, { text: "❌ Something went wrong!" });
  }
});


// ========================
// ===== CATEGORY SELECT =====
// ========================
cmd({
  filter: (text, { sender }) =>
    pendingMenu[sender] &&
    pendingMenu[sender].step === "category" &&
    /^[1-9][0-9]*$/.test(text.trim())
}, async (test, m, msg, { from, body, sender }) => {

  try {

    await test.sendMessage(from, { react: { text: "📂", key: m.key } });

    const pending = pendingMenu[sender];
    if (!pending) return;

    const { commandMap, categories } = pending;
    const index = parseInt(body.trim(), 10) - 1;

    if (index < 0 || index >= categories.length) {
      return await test.sendMessage(from, { text: "❌ වැරදි number එකක්." });
    }

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

    cmdText += `
╭━━━━━━━━━━━━━━━━━━╮
│ 🌸 ᴛᴏᴛᴀʟ : ${cmdsInCategory.length}
╰━━━━━━━━━━━━━━━━━━╯
`;

    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: cmdText
    }, { quoted: m });

  } catch (err) {
    console.error("Category Error:", err);
    await test.sendMessage(from, { text: "❌ දෝෂයක් වුණා!" });
  }
});
