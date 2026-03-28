const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

// User pending menu state
const pendingMenu = new Map();

// Header image
const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

const botName = "OSHIYA-MD ✅";
const ownerName = "OSHADHA";
const prefix = ".";

function toFancy(text) {
  return text.toUpperCase(); 
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

    if (!commands || commands.length === 0) return;

    const commandMap = {};
    commands.forEach(cmd => {
      if (!cmd.dontAddCommandList && cmd.pattern) {
        const cat = (cmd.category || "MISC").toUpperCase();
        if (!commandMap[cat]) commandMap[cat] = [];
        commandMap[cat].push(cmd);
      }
    });

    const categories = Object.keys(commandMap).sort();

    let menuText = `╔═══━━━─ • ─━━━═══╗
   👑  ${botName}  👑
╚═══━━━─ • ─━━━═══╝

╭━━━〔 👤 𝐈𝐍𝐅𝐎 〕━━━╮
┃ 👑 𝐎𝐰𝐧𝐞𝐫   : ${ownerName}
┃ 👤 𝐔𝐬𝐞𝐫    : ${pushname}
┃ 📅 𝐃𝐚𝐭𝐞    : ${date}
┃ ⏰ 𝐓𝐢𝐦𝐞    : ${time}
┃ ⚙️ 𝐏𝐫𝐞𝐟𝐢𝐱  : ${prefix}
╰━━━━━━━━━━━━━━━━━━╯

╭━━〔✧ *CATEGORIES* ✧〕━━╮\n`;

    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${toFancy(cat)} 〔 ${commandMap[cat].length} 〕\n`;
    });

    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 🌸`;

    await conn.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // Store the state
    pendingMenu.set(sender, { 
        step: "category", 
        commandMap, 
        categories,
        lastMsgId: m.key.id 
    });

    // Auto-delete after 2 mins
    setTimeout(() => pendingMenu.delete(sender), 120000);

  } catch (err) {
    console.error(err);
  }
});

// ============================
// ===== REPLY LISTENER =======
// ============================
// Logic to handle number replies (No pattern needed)
cmd({
  on: "body" // This ensures the bot listens to every message body
}, async (conn, m, msg, { from, body, sender }) => {
  const selected = body.trim();
  const userData = pendingMenu.get(sender);

  // Validation: Check if user has an active menu session and sent a number
  if (!userData || userData.step !== "category" || isNaN(selected)) return;

  try {
    const index = parseInt(selected) - 1;
    const { commandMap, categories } = userData;

    if (index < 0 || index >= categories.length) return;

    await conn.sendMessage(from, { react: { text: "📂", key: m.key } });

    const selectedCategory = categories[index];
    const cmdsInCategory = commandMap[selectedCategory];

    let cmdText = `╭━───❰ ${selectedCategory} ❱───━╮\n`;

    cmdsInCategory.forEach((c, i) => {
      cmdText += `
╭─❍ ${i + 1}
│ ✧ 𝐂𝐌𝐃 : ${prefix}${c.pattern}
│ ✧ 𝐈𝐍𝐅𝐎 : ${c.desc || "No info"}
╰───────────────❍\n`;
    });

    cmdText += `\n*Total Commands:* ${cmdsInCategory.length}\n*OSHIYA-MD*`;

    await conn.sendMessage(from, {
      image: { url: headerImage },
      caption: cmdText
    }, { quoted: m });

  } catch (err) {
    console.error("Reply Error:", err);
  }
});
