const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const os = require("os");
const QRCode = require("qrcode");
const axios = require("axios");

/* ======================== PREMIUM/OWNER SETUP ======================== */
const premiumUsers = ["94756599952@s.whatsapp.net"]; // <-- replace with your WhatsApp ID(s)

function isPremium(sender) {
  return premiumUsers.includes(sender);
}

/* ======================== QR CODE GENERATOR ======================== */
cmd({
  pattern: "qrcode",
  react: "🔗",
  desc: "Generate QR code from text or URL",
  category: "tools",
  use: ".qrcode <text or URL>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("🔗 *Provide text/URL to generate QR code.*\nExample: `.qrcode https://example.com`");
  const qrPath = path.join(os.tmpdir(), `qrcode-${Date.now()}.png`);
  try {
    await QRCode.toFile(qrPath, q.trim(), { type: "png", margin: 2, scale: 8 });
    const buffer = fs.readFileSync(qrPath);
    await oshiya.sendMessage(from, { image: buffer, caption: `╭〔 *🔗 QR Code Generated* 〕─⬣\n┃ 📝 Data: ${q.trim()}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) {
    reply("❌ *Failed to generate QR code.*");
  } finally {
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
  }
});

/* ======================== URL SHORTENER ======================== */
cmd({
  pattern: "shorturl",
  react: "✂️",
  desc: "Shorten a long URL",
  category: "tools",
  use: ".shorturl <long-url>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("✂️ *Provide URL to shorten.*");
  let url = q.trim();
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const shortUrl = response.data;
    await oshiya.sendMessage(from, { text: `╭〔 *✂️ URL Shortened* 〕─⬣\n┃ 🔗 Original: ${url}\n┃ ✨ Short: ${shortUrl}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) {
    reply("❌ *Failed to shorten URL.*");
  }
});

/* ======================== BASE64 ENCODE/DECODE ======================== */
cmd({
  pattern: "b64encode",
  react: "🔒",
  desc: "Encode text to Base64",
  category: "tools",
  use: ".b64encode <text>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("🔒 *Provide text to encode.*");
  try {
    const encoded = Buffer.from(q.trim()).toString("base64");
    await oshiya.sendMessage(from, { text: `╭〔 *🔒 Base64 Encode* 〕─⬣\n┃ Original: ${q.trim()}\n┃ Encoded: ${encoded}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to encode text.*"); }
});

cmd({
  pattern: "b64decode",
  react: "🔓",
  desc: "Decode Base64 text",
  category: "tools",
  use: ".b64decode <text>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("🔓 *Provide Base64 text to decode.*");
  try {
    const decoded = Buffer.from(q.trim(), "base64").toString("utf-8");
    await oshiya.sendMessage(from, { text: `╭〔 *🔓 Base64 Decode* 〕─⬣\n┃ Base64: ${q.trim()}\n┃ Decoded: ${decoded}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to decode Base64.*"); }
});

/* ======================== JSON FORMATTER ======================== */
cmd({
  pattern: "jsonfmt",
  react: "📝",
  desc: "Format JSON text",
  category: "tools",
  use: ".jsonfmt <json>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("📝 *Provide JSON text to format.*");
  try {
    const parsed = JSON.parse(q.trim());
    const formatted = JSON.stringify(parsed, null, 2);
    await oshiya.sendMessage(from, { text: `╭〔 *📝 JSON Formatter* 〕─⬣\n${formatted}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Invalid JSON.*"); }
});

/* ======================== WIFI QR CODE (Premium) ======================== */
cmd({
  pattern: "wifi",
  react: "📶",
  desc: "Generate Wi-Fi QR code (Premium only)",
  category: "tools",
  use: ".wifi <SSID|PASS|WPA|nopass>",
  filename: __filename,
}, async (oshiya, mek, m, { from, q, reply }) => {
  if (!isPremium(m.sender)) return reply("❌ *This command is Premium only.*");
  if (!q) return reply("📶 *Provide Wi-Fi details.* Example: `.wifi MySSID|MyPass|WPA`");
  const parts = q.split("|");
  if (parts.length < 3) return reply("📶 *Incorrect format.*");
  const [ssid, password, type] = parts.map(p => p.trim());
  const qrPath = path.join(os.tmpdir(), `wifi-${Date.now()}.png`);
  const wifiData = `WIFI:T:${type};S:${ssid};P:${password};;`;
  try {
    await QRCode.toFile(qrPath, wifiData, { type: "png", margin: 2, scale: 8 });
    const buffer = fs.readFileSync(qrPath);
    await oshiya.sendMessage(from, { image: buffer, caption: `╭〔 *📶 Wi-Fi QR Code* 〕─⬣\n┃ SSID: ${ssid}\n┃ Security: ${type}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to generate Wi-Fi QR code.*"); } finally { if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath); }
});

/* ======================== TEXT/BINARY/REVERSE ======================== */
cmd({ pattern: "txt2bin", react: "💻", desc: "Convert text to binary", category: "tools", use: ".txt2bin <text>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("💻 *Provide text.*");
  try {
    const binary = q.trim().split("").map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ");
    await oshiya.sendMessage(from, { text: `╭〔 *💻 Text to Binary* 〕─⬣\n┃ Text: ${q.trim()}\n┃ Binary: ${binary}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to convert text to binary.*"); }
});

cmd({ pattern: "bin2txt", react: "💻", desc: "Convert binary to text", category: "tools", use: ".bin2txt <binary>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("💻 *Provide binary.*");
  try {
    const text = q.trim().split(" ").map(b => String.fromCharCode(parseInt(b,2))).join("");
    await oshiya.sendMessage(from, { text: `╭〔 *💻 Binary to Text* 〕─⬣\n┃ Binary: ${q.trim()}\n┃ Text: ${text}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to convert binary.*"); }
});

cmd({ pattern: "reverse", react: "🔄", desc: "Reverse text", category: "tools", use: ".reverse <text>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("🔄 *Provide text to reverse.*");
  try {
    const reversed = q.trim().split("").reverse().join("");
    await oshiya.sendMessage(from, { text: `╭〔 *🔄 Reverse Text* 〕─⬣\n┃ Original: ${q.trim()}\n┃ Reversed: ${reversed}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to reverse text.*"); }
});

/* ======================== MORSE CODE ======================== */
const morseMap = { "A":".-","B":"-...","C":"-.-.","D":"-..","E":".","F":"..-.","G":"--.","H":"....","I":"..","J":".---","K":"-.-","L":".-..","M":"--","N":"-.","O":"---","P":".--.","Q":"--.-","R":".-.","S":"...","T":"-","U":"..-","V":"...-","W":".--","X":"-..-","Y":"-.--","Z":"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----."," ":"/","!":"-.-.--","?":"..--..",",":"--..--",".":".-.-.-","-":"-....-"};

cmd({ pattern: "morse", react: "📡", desc: "Text to Morse code", category: "tools", use: ".morse <text>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("📡 *Provide text to convert to Morse code.*");
  try {
    const morse = q.trim().toUpperCase().split("").map(c => morseMap[c]||"?").join(" ");
    await oshiya.sendMessage(from, { text: `╭〔 *📡 Morse Encode* 〕─⬣\n┃ Text: ${q.trim()}\n┃ Morse: ${morse}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to convert to Morse code.*"); }
});

cmd({ pattern: "demorse", react: "📡", desc: "Morse code to text", category: "tools", use: ".demorse <morse>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!q) return reply("📡 *Provide Morse code to decode.*");
  try {
    const invMap = Object.fromEntries(Object.entries(morseMap).map(([k,v]) => [v,k]));
    const text = q.trim().split(" ").map(c => invMap[c]||"?").join("");
    await oshiya.sendMessage(from, { text: `╭〔 *📡 Morse Decode* 〕─⬣\n┃ Morse: ${q.trim()}\n┃ Text: ${text}\n╰───────────────⬣` }, { quoted: mek });
  } catch (e) { reply("❌ *Failed to decode Morse code.*"); }
});

/* ======================== PREMIUM COMMANDS ======================== */
const premiumCommands = ["passgen", "lorem", "emoji"]; // locked commands

cmd({ pattern: "passgen", react: "🔑", desc: "Generate a random password (Premium only)", category: "tools", use: ".passgen <length>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!isPremium(m.sender)) return reply("❌ *This command is Premium only.*");
  const length = parseInt(q) || 12;
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  await oshiya.sendMessage(from, { text: `╭〔 *🔑 Random Password* 〕─⬣\n┃ Length: ${length}\n┃ Password: ${password}\n╰───────────────⬣` }, { quoted: mek });
});

cmd({ pattern: "lorem", react: "📄", desc: "Generate Lorem Ipsum (Premium only)", category: "tools", use: ".lorem <words>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!isPremium(m.sender)) return reply("❌ *This command is Premium only.*");
  const wordsCount = parseInt(q) || 20;
  const loremWords = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");
  let text = "";
  for (let i = 0; i < wordsCount; i++) text += loremWords[Math.floor(Math.random() * loremWords.length)] + " ";
  await oshiya.sendMessage(from, { text: `╭〔 *📄 Lorem Ipsum* 〕─⬣\n${text.trim()}\n╰───────────────⬣` }, { quoted: mek });
});

cmd({ pattern: "emoji", react: "😎", desc: "Convert text to emoji style (Premium only)", category: "tools", use: ".emoji <text>", filename: __filename }, async (oshiya, mek, m, { from, q, reply }) => {
  if (!isPremium(m.sender)) return reply("❌ *This command is Premium only.*");
  if (!q) return reply("😎 *Provide text to convert to emoji.*");
  const emojiText = q.trim().split("").map(c => c.match(/[a-zA-Z0-9]/) ? `:${c.toLowerCase()}:` : c).join(" ");
  await oshiya.sendMessage(from, { text: `╭〔 *😎 Emoji Style* 〕─⬣\n${emojiText}\n╰───────────────⬣` }, { quoted: mek });
});

/* ======================== RANDOM COLOR (Free) ======================== */
cmd({ pattern: "color", react: "🎨", desc: "Generate a random hex color", category: "tools", use: ".color", filename: __filename }, async (oshiya, mek, m, { from }) => {
  const hex = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6,"0");
  await oshiya.sendMessage(from, { text: `╭〔 *🎨 Random Color* 〕─⬣\n┃ Hex: ${hex}\n╰───────────────⬣` }, { quoted: mek });
});
