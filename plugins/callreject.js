const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "autocall",
  desc: "Auto Call Reject (Owner only)",
  category: "settings",
  react: "📞",
  filename: __filename
}, async (test, mek, m, { q, reply, sender }) => {

  // ✅ OWNER CHECK (config එකෙන්)
  const ownerNumber = config.OWNER_NUMBER.includes("@")
    ? config.OWNER_NUMBER
    : config.OWNER_NUMBER + "@s.whatsapp.net";

  if (sender !== ownerNumber) {
    return reply("❌ This command is only for bot owner");
  }

  // ✅ COMMAND LOGIC
  if (!q) return reply("Use: .autocall on / off");

  if (q.toLowerCase() === "on") {
    config.AUTO_CALL_END = true;
    reply("✅ AUTO CALL REJECT ENABLED");
  } else if (q.toLowerCase() === "off") {
    config.AUTO_CALL_END = false;
    reply("❌ AUTO CALL REJECT DISABLED");
  } else {
    reply("❌ Invalid option, use on/off");
  }
});
