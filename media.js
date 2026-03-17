const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "Download MediaFire files",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ 𝐋𝐈𝐍𝐊 𝐍𝐎𝐓 𝐖𝐎𝐑𝐊𝐈𝐍𝐆");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${q}`);

    if (!data?.status) return reply("❌ 𝐍𝐎𝐓 𝐌𝐄𝐃𝐈𝐀𝐅𝐈𝐑𝐄");

    const { dl_link, fileName, fileType } = data.result;

    const caption = `
╭━━━〔 𝐎𝐒𝐇𝐈𝐘𝐀-𝐌𝐃 ⚡ 〕━━━⬣
┃ 📁 ${fileName}
┃ 📦 ${fileType}
╰━━━━━━━━━━━━━━━━━━⬣
`;

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: fileType,
      fileName,
      caption
    }, { quoted: m });

  } catch (e) {
    console.log(e);
    reply("❌ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋");
  }
});
