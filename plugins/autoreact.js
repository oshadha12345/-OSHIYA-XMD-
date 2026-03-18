const { cmd } = require('../command');
const config = require('../config')

cmd({
  pattern: "autostatusreact",
  desc: "Turn AUTO_CALL_END ON/OFF (Owner only)",
  owner: true,
  react: "✅",
}, async (test, mek, m, { q, reply }) => {
  if (!q) return reply(".statusautoreact 𝐨𝐧/𝐨𝐟𝐟");
  
  if (q.toLowerCase() === "on") {
    config.AUTO_STATUS_REACT = true;
    reply("✅ 𝐀𝐔𝐓𝐎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐑𝐄𝐀𝐂𝐓 𝐎𝐍");
  } else if (q.toLowerCase() === "off") {
    config.AUTO_STATUS_REACT = false;
    reply("❌ 𝐀𝐔𝐓𝐎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐑𝐄𝐀𝐂𝐓 𝐎𝐅𝐅");
  } else {
    reply("❌ Invalid option, use on/off");
  }
});
