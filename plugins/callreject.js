const { cmd } = require('../command');
const config = require('../config')

cmd({
  pattern: "autocall",
  desc: "Turn AUTO_CALL_END ON/OFF (Owner only)",
  owner: true,
  react: "📞",
}, async (test, mek, m, { q, reply }) => {
  if (!q) return reply(".𝐚𝐮𝐭𝐨𝐜𝐚𝐥𝐥 𝐨𝐧/𝐨𝐟𝐟");
  
  if (q.toLowerCase() === "on") {
    config.AUTO_CALL_END = true;
    reply("✅ 𝐀𝐔𝐓𝐎 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓");
  } else if (q.toLowerCase() === "off") {
    config.AUTO_CALL_END = false;
    reply("❌ 𝐀𝐔𝐓𝐎 𝐂𝐀𝐋𝐋 𝐑𝐄𝐉𝐄𝐂𝐓 𝐎𝐅𝐅");
  } else {
    reply("❌ Invalid option, use on/off");
  }
});
