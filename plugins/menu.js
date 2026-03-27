const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

// User pending menu state
const pendingMenu = {};

// Header image
const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

// ====== CONFIG ======
const botName = "OSHIYA-MD";
const ownerName = "OSHADHA";
const prefix = ".";
// ====================

// Fancy Bold Converter (ඔයාට වෙනස් කරලා fancy letters දාන්න පුළුවන්)
function toFancy(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // දැන් simple
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
    // React to message
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

    // Build menu text
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

╭━━〔✧ *CATEGORIES* ✧〕━━╮
`;

    categories.forEach((cat, i) => {
      const styled = toFancy(cat);
      menuText += `│ ${i + 1}. ${styled} 〔 ${commandMap[cat].length} 〕\n`;
    });

    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n`;
    menuText += `\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 🌸`;

    // Send menu
    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // Save pending menu for user
    pendingMenu[sender] = { step: "category", commandMap, categories };

    // Auto expire 2 minutes
    setTimeout(() => {
      delete pendingMenu[sender];
    }, 2 * 60 * 1000);

  } catch (err) {
    console.error("Error in menu command:", err);
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
╭━───❰ ${selectedCategory} ❱───━╮
`;

    cmdsInCategory.forEach((c, i) => {
      const patterns = [c.pattern]; // alias එක ignore කරලා
      cmdText += `
╭─❍ ${i + 1}
│ ✧ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 : ${patterns.join(" | ")}
│ ✧ 𝐈𝐍𝐅𝐎    : ${c.desc || "No description"}
╰───────────────❍
`;
    });

    cmdText += `
╭━━━━━━━━━━━━━━━━━━╮
│ 🌸 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : ${cmdsInCategory.length}
╰━━━━━━━━━━━━━━━━━━╯
`;

    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: cmdText
    }, { quoted: m });

    // 🔹 menu state keep කරනවා, so user repeat කරන්න පුළුවන්
    // delete pendingMenu[sender]; // comment this line

  } catch (err) {
    console.error("Error in category selection:", err);
    await test.sendMessage(from, { text: "❌ දෝෂයක් වුණා!" });
  }
});
