const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

// ================= STATE =================
const pendingMenu = {};

// ================= CONFIG =================
const botName = "OSHIYA-MD";
const ownerName = "OSHADHA";
const prefix = ".";
const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

// 🔊 Put your voice mp3 direct link here
const autoVoice = "https://files.catbox.moe/xyz123.mp3"; 
// ==========================================


// ===== 𝐁𝐎𝐋𝐃 𝐅𝐎𝐍𝐓 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐄𝐑 =====
function toFancy(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy  = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙";

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

    // ===== BUILD MENU TEXT =====
    let menuText = `╔═══━━━─ • ─━━━═══╗
   👑  𝐎𝐒𝐇𝐈𝐘𝐀 - 𝐌𝐃  👑
╚═══━━━─ • ─━━━═══╝

╭━━━〔 👤 𝐈𝐍𝐅𝐎 〕━━━╮
┃ 👑 𝐎𝐰𝐧𝐞𝐫   : ${ownerName}
┃ 👤 𝐔𝐬𝐞𝐫    : ${pushname}
┃ 📅 𝐃𝐚𝐭𝐞    : ${date}
┃ ⏰ 𝐓𝐢𝐦𝐞    : ${time}
┃ ⚙️ 𝐏𝐫𝐞𝐟𝐢𝐱  : ${prefix}
╰━━━━━━━━━━━━━━━━━━╯

╭━━〔✧ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒 ✧〕━━╮
`;

    categories.forEach((cat, i) => {
      const styled = toFancy(cat);
      menuText += `│ ${i + 1}. ${styled} 〔 ${commandMap[cat].length} 〕\n`;
    });

    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n`;
    menuText += `\n🌸 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐧𝐮𝐦𝐛𝐞𝐫`;

    // ===== SEND MENU IMAGE =====
    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // ===== AUTO VOICE SEND =====
    await test.sendMessage(from, {
      audio: { url: autoVoice },
      mimetype: "audio/mp4",
      ptt: true
    });

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

    let cmdText = `
╭━───❰ ${toFancy(selectedCategory)} ❱───━╮
`;

    cmdsInCategory.forEach((c, i) => {
      cmdText += `
╭─❍ ${i + 1}
│ ✧ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 : ${prefix}${c.pattern}
│ ✧ 𝐈𝐍𝐅𝐎    : ${c.desc || "No description"}
╰───────────────❍
`;
    });

    cmdText += `
╭━━━━━━━━━━━━━━━━━━╮
│ 🌸 𝐓𝐨𝐭𝐚𝐥 : ${cmdsInCategory.length}
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
