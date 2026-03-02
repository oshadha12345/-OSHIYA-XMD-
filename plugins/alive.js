const { cmd } = require("../command");

cmd(
  {
    pattern: "alive",
    react: "🤖",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const from = mek.key.remoteJid;

      await malvin.sendPresenceUpdate("recording", from);

      // Alive Image & Caption
      await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg",
          },
          caption: `𝗠𝗔𝗟𝗨 𝗫𝗗 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘 𝗡𝗢𝗪  
  
𝗼𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝘄𝗵𝗮𝘁𝘀𝗮𝗽𝗽 𝗰𝗵𝗮𝗻𝗲𝗹 -: https://whatsapp.com/channel/0029VbB3YxTDJ6H15SKoBv3S

𝗚𝗶𝘁 𝗛𝘂𝗯 𝗥𝗲𝗽𝗼 -: https://github.com/XdKing2/MALU-XD

𝗢𝘄𝗻𝗲𝗿 -: https://t.me/devmalvin
          
*We are not responsible for any*  
*WhatsApp bans that may occur due to*  
*the usage of this bot. Use it wisely*  
*and at your own risk* ⚠️`,
        },
        { quoted: mek }
      );

      // Delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Voice Message
      await malvin.sendMessage(
        from,
        {
          audio: {
            url: "https://github.com/oshadha12345/images/raw/refs/heads/main/Voice/Parano%20(Tiktok%20Version)%20-%20Frozy%20Ft.%20DDB%20%5BEdit%20Audio%5D(MP3_160K).mp3",
          },
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
          })
