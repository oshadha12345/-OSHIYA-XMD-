const config = require('../config');
const { cmd, commands } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
  pattern: "restart",
  alias: ["reboot"],
  react: "🔄",
  desc: "Restart the bot",
  category: "owner",
  filename: __filename,

  async function(client, mek, m, { from, isOwner, reply }) {

    if (!isOwner) return reply("❌ Owner only command!");

    await reply("🔄 Bot is restarting...");

    setTimeout(() => {
      process.exit(0);
    }, 1500);

  }
});