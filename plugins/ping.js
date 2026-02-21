const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    react: "🔥",
    desc: "Check bot's speed.",
    category: "main",
    filename: __filename,
  },
  async (oshiya, mek, m, { from }) => {
    try {
      const startTime = Date.now();
      const endTime = Date.now();
      const pingTime = (endTime - startTime).toFixed(5);  // Set precision to 5 decimal places

      // Simple ping response with 5 decimal places
      let pingText = `🔥 𝙋𝙊𝙉𝙂 : ${pingTime} ms`;

      // Sending the ping value
      await oshiya.sendMessage(from, { text: pingText }, { quoted: mek });

    } catch (err) {
      console.error(err);
    }
  }
);