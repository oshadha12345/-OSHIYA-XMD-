const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config.js");

commands.push({
  pattern: "autostatussend",
  alias: ["statussend"],
  react: "⚙️",
  function: async (conn, mek, m, { args, reply, isOwner }) => {

    if (!isOwner) return reply("❌ Me command eka owner ta witharai.");

    if (!args[0]) {
      return reply("Usage:\n\n.autostatussend on\n.autostatussend off");
    }

    const input = args[0].toLowerCase();

    if (input === "on") {
      config.AUTO_STATUS_SEND = "true";
      reply("✅ Auto Status Send ON karala thiyenawa.");

    } else if (input === "off") {
      config.AUTO_STATUS_SEND = "false";
      reply("❌ Auto Status Send OFF karala thiyenawa.");

    } else {
      return reply("On naththam Off kiyala denna.");
    }
  }
});