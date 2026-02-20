const { cmd, commands } = require("../command");
const moment = require("moment-timezone");

const pendingMenu = {};

const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg";

// ====== EDIT THESE ======
const botName = "OSHIYA-MD";
const ownerName = "OSHADHA";
const prefix = ".";
// =========================

// Fancy italic bold converter
function toFancy(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy  = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙";
  return text.split("").map(c => {
    const i = normal.indexOf(c);
    return i !== -1 ? fancy[i] : c;
  }).join("");
}

cmd({
  pattern: "menu",
  react: "📂",
  desc: "Show command categories",
  category: "main",
  filename: __filename
}, async (test, m, msg, { from, sender, pushname }) => {

  await test.sendMessage(from, { react: { text: "📂", key: m.key } });

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

  let menuText = `╭━━━〔 ${botName} 〕━━━╮\n`;
  menuText += `┃ 👑 Owner : ${ownerName}\n`;
  menuText += `┃ 👤 User  : ${pushname}\n`;
  menuText += `┃ 📅 Date  : ${date}\n`;
  menuText += `┃ ⏰ Time  : ${time}\n`;
  menuText += `┃ ⚙ Prefix : ${prefix}\n`;
  menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;

  menuText += `➘ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 ➘\n\n`;
  menuText += `┌━━━━━━━━━━━━━━━━━━┑\n`;

  categories.forEach((cat, i) => {
    const styled = toFancy(cat);
    menuText += `${i + 1} ❱ ${styled} (${commandMap[cat].length})\n`;
  });

  menuText += `┕━━━━━━━━━━━━━━━━━━┙\n`;
  menuText += `*Reply with category number* ✨`;

  await test.sendMessage(from, {
    image: { url: headerImage },
    caption: menuText,
  }, { quoted: m });

  pendingMenu[sender] = { step: "category", commandMap, categories };
});

cmd({
  filter: (text, { sender }) =>
    pendingMenu[sender] &&
    pendingMenu[sender].step === "category" &&
    /^[1-9][0-9]*$/.test(text.trim())
}, async (test, m, msg, { from, body, sender, reply }) => {

  await test.sendMessage(from, { react: { text: "💐", key: m.key } });

  const { commandMap, categories } = pendingMenu[sender];
  const index = parseInt(body.trim()) - 1;

  if (index < 0 || index >= categories.length)
    return reply("❌ Invalid selection.");

  const selectedCategory = categories[index];
  const cmdsInCategory = commandMap[selectedCategory];

  let cmdText = `╭━━━〔 ${selectedCategory} 〕━━━╮\n\n`;

  cmdsInCategory.forEach((c, i) => {
    const patterns = [c.pattern, ...(c.alias || [])]
      .filter(Boolean)
      .map(p => `${prefix}${p}`);
    cmdText += `❯ ${patterns.join(", ")}\n`;
    cmdText += `   ➥ ${c.desc || "No description"}\n\n`;
  });

  cmdText += `┕━━━━━━━━━━━━━━━━━━┙\n`;
  cmdText += `⚠ *Total Commands*: ${cmdsInCategory.length}`;

  await test.sendMessage(from, {
    image: { url: headerImage },
    caption: cmdText,
  }, { quoted: m });

  delete pendingMenu[sender];
});