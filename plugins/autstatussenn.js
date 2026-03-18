const { cmd } = require('../command');
const config = require('../config')

cmd({
  pattern: "autostatusseen",
  desc: "Turn AUTO_CALL_END ON/OFF (Owner only)",
  owner: true,
  react: "✅",
}, async (test, mek, m, { q, reply }) => {
  if (!q) return reply(".𝐒𝐭𝐚𝐭𝐮𝐬 𝐬𝐞𝐞𝐧 𝐨𝐧/𝐨𝐟𝐟");
  
  if (q.toLowerCase() === "on") {
    config.AUTO_STATUS_SEEN = true;
    reply("✅ 𝐀𝐔𝐓𝐎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐒𝐄𝐄𝐍 𝐎𝐍");
  } else if (q.toLowerCase() === "off") {
    config.AUTO_STATUS_SEEN = false;
    reply("❌ 𝐀𝐔𝐓𝐎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐒𝐄𝐄𝐍 𝐎𝐅𝐅");
  } else {
    reply("❌ Invalid option, use on/off");
  }
});
