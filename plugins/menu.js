const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

// Store pending menu selections per user
const pendingMenu = {};

// Header image
const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

// ====== CONFIG ======
const botName = "OSHIYA-MD";
const ownerName = "OSHADHA";
const prefix = ".";
// ====================

// Fancy Bold Converter (you can replace with true fancy letters if desired)
function toFancy(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return text.toUpperCase().split("").map(c => {
    const i = normal.indexOf(c);
    return i !== -1 ? fancy[i] : c;
  }).join("");
}

// ----- MAIN MENU COMMAND -----
cmd({
  pattern: "menu",
  react: "🌸",
  desc: "Show command categories",
  category: "main",
  filename: __filename
}, async (test, m, msg, { from, sender, pushname }) => {

  try {
    // React to the message
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
    let menuText = `
⚠ 𝐎𝐒𝐇𝐈𝐘𝐀-𝐌𝐃 ⚠
👑 Owner : ${ownerName}
👤 User  : ${pushname || "Unknown"}
📅 Date  : ${date}
⏰ Time  : ${time}
⚙ Prefix : ${prefix}

╭━━━〔 ✧ CATEGORIES ✧ 〕━━━╮
`;

    categories.forEach((cat, i) => {
      const styled = toFancy(cat);
      menuText += `│ ${i + 1}. ${styled} 〔 ${commandMap[cat].length} 〕\n`;
    });

    menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━━━╯\n`;
    menuText += `\n🌸 > Reply with category number`;

    // Send menu
    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m });

    // Save pending menu state
    pendingMenu[sender] = { step: "category", commandMap, categories };

  } catch (err) {
    console.error("Error in menu command:", err);
    await test.sendMessage(from, { text: "❌ Something went wrong!" });
  }
});

// ----- CATEGORY SELECTION -----
cmd({
  filter: (text, { sender }) =>
    pendingMenu[sender] &&
    pendingMenu[sender].step === "category" &&
    /^[1-9][0-9]*$/.test(text.trim())
}, async (test, m, msg, { from, body, sender }) => {

  try {
    await test.sendMessage(from, { react: { text: "💐", key: m.key } });

    const pending = pendingMenu[sender];
    if (!pending) return;

    const { commandMap, categories } = pending;
    const index = parseInt(body.trim(), 10) - 1;

    if (index < 0 || index >= categories.length) {
      return await test.sendMessage(from, { text: "❌ Invalid selection." });
    }

    const selectedCategory = categories[index];
    const cmdsInCategory = commandMap[selectedCategory];

    let cmdText = `
╭━━━〔 ✦ ${selectedCategory} ✦ 〕━━━╮
`;

    cmdsInCategory.forEach((c, i) => {
      const patterns = [c.pattern, ...(c.alias || [])]
        .filter(Boolean)
        .map(p => `「 ${prefix}${p} 」`);
      cmdText += `
╭─❍ ${i + 1}
│ ✧ Command : ${patterns.join(" | ")}
│ ✧ Info    : ${c.desc || "No description"}
╰───────────────❍
`;
    });

    cmdText += `
╭━━━━━━━━━━━━━━━━━━╮
│ 🌸 Total Commands : ${cmdsInCategory.length}
╰━━━━━━━━━━━━━━━━━━╯
`;

    await test.sendMessage(from, {
      image: { url: headerImage },
      caption: cmdText
    }, { quoted: m });

    // Remove pending menu
    delete pendingMenu[sender];

  } catch (err) {
    console.error("Error in category selection:", err);
    await test.sendMessage(from, { text: "❌ Something went wrong!" });
  }
});