const config = require("../config");
const { cmd } = require("../command");

cmd({
    pattern: "autostatussend",
    alias: ["statussend"],
    react: "⚙️",
    desc: "Enable or Disable Auto Status Forward",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { args }) => {

    const from = mek.key.remoteJid;
    const sender = mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split("@")[0];

    // ⚠️ Owner number eka hariyata danna
    const ownerNumber = "94725364886";

    const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });

    if (senderNumber !== ownerNumber) {
        return reply("❌ Me command eka owner ta witharai.");
    }

    if (!args[0]) {
        return reply("Usage:\n\n.autostatussend on\n.autostatussend off");
    }

    const input = args[0].toLowerCase();

    if (input === "on") {
        config.AUTO_STATUS_SEND = "true";
        return reply("✅ Auto Status Send ON karala thiyenawa.");
    }

    if (input === "off") {
        config.AUTO_STATUS_SEND = "false";
        return reply("❌ Auto Status Send OFF karala thiyenawa.");
    }

    return reply("On naththam Off kiyala denna.");
});