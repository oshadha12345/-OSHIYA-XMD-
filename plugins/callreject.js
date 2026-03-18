const { cmd } = require('../command');
const config = require('../config')

cmd({
  pattern: "autocall",
  desc: "Turn AUTO_CALL_END ON/OFF (Owner only)",
  owner: true,
  react: "📞",
}, async (test, mek, m, { q, reply }) => {
  if (!q) return reply("Use: .autocall on/off");
  
  if (q.toLowerCase() === "on") {
    config.AUTO_CALL_END = true;
    reply("✅ AUTO_CALL_END is now ON");
  } else if (q.toLowerCase() === "off") {
    config.AUTO_CALL_END = false;
    reply("✅ AUTO_CALL_END is now OFF");
  } else {
    reply("❌ Invalid option, use on/off");
  }
});
