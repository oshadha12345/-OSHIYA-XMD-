const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "apk",
    alias: ["android", "app", "af"],
    react: "📦",
    desc: "APK Downloader",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { q, reply, from }) => {
    try {
      if (!q) {
        return reply(
          "❌ *App name ekak denna!*\n\n📌 Example: .apk whatsapp"
        );
      }

      // 🔍 searching react
      await conn.sendMessage(from, {
        react: { text: "🔍", key: mek.key },
      });

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(
        q
      )}/limit=1`;

      const { data } = await axios.get(apiUrl);

      if (!data?.datalist?.list?.length) {
        return reply("𝐍𝐎 𝐀𝐏𝐊 ❌");
      }

      const app = data.datalist.list[0];

      const size = (app.size / 1048576).toFixed(2);
      const rating = app.stats?.rating?.avg || "0.0";
      const downloads = app.stats?.downloads || "0";

      const caption = `
╭━━━〔 📦 𝐎.𝐀.𝐃 〕━━━┈⊷
┃ 📌 *Name:* ${app.name}
┃ 📦 *Package:* ${app.package}
┃ 🛠 *Version:* ${app.file?.vername || "Unknown"}
┃ ⭐ *Rating:* ${rating}
┃ 📥 *Downloads:* ${downloads}
┃ 💾 *Size:* ${size} MB
╰━━━━━━━━━━━━━━━━━━━━━━┈⊷
`;

      // 📸 send preview
      await conn.sendMessage(
        from,
        {
          image: { url: app.icon },
          caption: caption,
        },
        { quoted: mek }
      );

      // ⬇️ downloading react
      await conn.sendMessage(from, {
        react: { text: "⬇️", key: mek.key },
      });

      // 📥 send apk
      await conn.sendMessage(
        from,
        {
          document: { url: app.file.path_alt },
          fileName: `${app.name}.apk`,
          mimetype: "application/vnd.android.package-archive",
        },
        { quoted: mek }
      );

      // ✅ done react
      await conn.sendMessage(from, {
        react: { text: "✅", key: mek.key },
      });
    } catch (err) {
      console.error("❌ APK ERROR:", err);
      reply("❌ *Download karaddi error ekak awa!*");
    }
  }
);
