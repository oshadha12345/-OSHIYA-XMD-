const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    react: "📜",
    desc: "Displays all available commands",
    category: "main",
    filename: __filename,
  },
  async (danua, mek, m, { from, pushname, reply }) => {
    try {
      const categories = {};

      // Categorize commands
      for (let cmdName in commands) {
        const cmdData = commands[cmdName];
        const cat = cmdData.category?.toLowerCase() || "other";

        if (!categories[cat]) categories[cat] = [];

        categories[cat].push({
          pattern: cmdData.pattern,
          desc: cmdData.desc || "No description",
        });
      }

      // Header
      let menuText = `
╭━━━〔 🤖 *OSHIYA-MD MENU* 〕━━━┈⊷
┃ 👤 User : ${pushname || "User"}
┃ 📅 Date : ${new Date().toLocaleDateString()}
┃ ⏰ Time : ${new Date().toLocaleTimeString()}
╰━━━━━━━━━━━━━━━━━━┈⊷
`;

      // Categories
      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n╭━━━〔 📂 *${cat.toUpperCase()}* 〕━━━┈⊷\n`;

        cmds.forEach((c, i) => {
          menuText += `┃ ${i + 1}. ⚡ .${c.pattern}\n┃     └ ${c.desc}\n`;
        });

        menuText += "╰━━━━━━━━━━━━━━━━━━┈⊷\n";
      }

      // Footer
      menuText += `
╭━━━━━━━━━━━━━━━━━━┈⊷
┃ 🔥 Powered By OSHIYA-MD
┃ 💎 Premium WhatsApp Bot
╰━━━━━━━━━━━━━━━━━━┈⊷
`;

      await reply(menuText.trim());
    } catch (err) {
      console.error(err);
      reply("❌ Error generating menu.");
    }
  }
);
