const config = require('../config');
const { cmd, commands } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
  pattern: "restart",
  react: '♻️',
  desc: "Restart the bot",
  category: "main",
  filename: __filename
}, async (
  conn, mek, m, {
    from, sender, reply
  }
) => {
  try {
    const ownerJid = config.BOT_OWNER + '@s.whatsapp.net';

    if (sender !== ownerJid) {
      return reply("❌ 𝐎𝐖𝐍𝐄𝐑 𝐎𝐍𝐋𝐘");
    }

    await reply("♻️ *Restarting Bot...*");
    await sleep(1500);

    process.exit(1); // PM2 will auto restart

  } catch (e) {
    console.error("Restart error:", e);
    reply("❌ Failed to restart:\n" + e);
  }
});