const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    react: "🏓",
    desc: "Bot response speed test",
    category: "main",
    filename: __filename,
  },
  async (danuwa, mek, m, { reply }) => {
    const start = Date.now();
    await reply("🏓 *Pinging*...");
    const end = Date.now();
    await reply(`🏓 *Pong*! *${end - start}ms*`);
  }
);
