const { cmd } = require("../command");
const config = require("../config");

// 🔐 Auto Reply Status
let AUTO_REPLY = false;

// 💬 Auto Reply Words
const autoReplies = {
  hi: "👋 Hello! I'm OSHIYA MD.",
  hello: "👋 Hi there! How can I help you?",
  bot: "🤖 Yes, I'm alive and running!",
  owner: "👑 Owner: https://t.me/devmalvin",
  repo: "📂 GitHub: https://github.com/oshadha12345/-OSHIYA-XMD-",
};

// ===============================
// 🔘 ON / OFF COMMAND (Bot Admin Only)
// ===============================

cmd(
  {
    pattern: "autoreply",
    fromMe: true, // ⚡ Bot admin ta witharai
    desc: "Turn on/off auto reply",
    category: "settings",
  },
  async (malvin, mek, m, { args, reply }) => {
    if (!args[0]) {
      return reply("Use:\n.autoreply on\n.autoreply off");
    }

    const option = args[0].toLowerCase();

    if (option === "on") {
      AUTO_REPLY = true;
      return reply("✅ *Auto Reply Enabled*");
    }

    if (option === "off") {
      AUTO_REPLY = false;
      return reply("❌ *Auto Reply Disabled*");
    }

    reply("Invalid option! Use on/off");
  }
);

// ===============================
// 🤖 AUTO REPLY SYSTEM
// ===============================

cmd(
  {
    on: "body",
  },
  async (malvin, mek, m, { body, from }) => {
    try {
      if (!AUTO_REPLY) return;
      if (!body) return;

      // Private mode check
      if (config.MODE === "private" && !mek.key.fromMe) return;

      const text = body.toLowerCase();

      for (let word in autoReplies) {
        if (text.includes(word)) {
          await malvin.sendMessage(
            from,
            { text: autoReplies[word] },
            { quoted: mek }
          );
          break;
        }
      }
    } catch (err) {
      console.log("AutoReply Error:", err);
    }
  }
);