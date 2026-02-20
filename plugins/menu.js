
import moment from "moment-timezone"
import { cmd, commands } from "../command.js"

// ================= CONFIG =================
const ownerName = "OSHADHA"
const prefix = "."
const headerImage = "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg"

const autoVoice = "https://github.com/oshadha12345/images/raw/refs/heads/main/Voice/gata%20only%20(tiktok%20version_best%20part_)%20-%20floyymenor%20ft.%20cris%20mj%E3%80%8Eedit%20audio%E3%80%8F(MP3_160K).mp3"
// ==========================================

const pendingMenu = {}

// ================= MAIN MENU =================
cmd({
  pattern: "menu",
  react: "🌸",
  desc: "Show command categories",
  category: "main",
  filename: import.meta.url
}, async (client, m, msg, { from, sender, pushname }) => {

  try {

    // 🌸 React
    await client.sendMessage(from, {
      react: { text: "🌸", key: m.key }
    })

    // 🔊 AUTO VOICE (PTT)
    await client.sendFile(
      from,
      autoVoice,
      "voice.mp3",
      "",
      m,
      { ptt: true }
    )

    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD")
    const time = moment().tz("Asia/Colombo").format("HH:mm:ss")

    if (!commands || !Array.isArray(commands) || commands.length === 0) {
      return client.sendMessage(from, { text: "❌ No commands found!" })
    }

    // Organize commands
    const commandMap = {}
    for (const command of commands) {
      if (command.dontAddCommandList) continue
      const category = (command.category || "MISC").toUpperCase()
      if (!commandMap[category]) commandMap[category] = []
      commandMap[category].push(command)
    }

    const categories = Object.keys(commandMap)

    if (categories.length === 0) {
      return client.sendMessage(from, { text: "❌ No categories available!" })
    }

    // Build Menu
    let menuText = `╔═══━━━─── • ───━━━═══╗
   👑  𝐎𝐒𝐇𝐈𝐘𝐀 - 𝐌𝐃  👑
╚═══━━━─── • ───━━━═══╝

╭━━━〔 👤 USER INFO 〕━━━╮
┃ 👑 Owner   : ${ownerName}
┃ 👤 User    : ${pushname}
┃ 📅 Date    : ${date}
┃ ⏰ Time    : ${time}
┃ ⚙️ Prefix  : ${prefix}
╰━━━━━━━━━━━━━━━━━━╯

╭━━〔 ✧ CATEGORIES ✧ 〕━━╮
`

    categories.forEach((cat, i) => {
      menuText += `│ ${i + 1}. ${cat} 〔 ${commandMap[cat].length} 〕\n`
    })

    menuText += `╰━━━━━━━━━━━━━━━━━━╯\n`
    menuText += `\nReply with category number 🌸`

    // Send Menu Image + Caption
    await client.sendMessage(from, {
      image: { url: headerImage },
      caption: menuText
    }, { quoted: m })

    // Save user state
    pendingMenu[sender] = { step: "category", commandMap, categories }

    setTimeout(() => {
      delete pendingMenu[sender]
    }, 120000)

  } catch (err) {
    console.log(err)
    await client.sendMessage(from, { text: "❌ Something went wrong!" })
  }

})


// ================= CATEGORY SELECT =================
cmd({
  filter: (text, { sender }) =>
    pendingMenu[sender] &&
    pendingMenu[sender].step === "category" &&
    /^[1-9][0-9]*$/.test(text.trim())
}, async (client, m, msg, { from, body, sender }) => {

  try {

    await client.sendMessage(from, {
      react: { text: "📂", key: m.key }
    })

    const pending = pendingMenu[sender]
    if (!pending) return

    const { commandMap, categories } = pending
    const index = parseInt(body.trim(), 10) - 1

    if (index < 0 || index >= categories.length) {
      return client.sendMessage(from, { text: "❌ වැරදි number එකක්." })
    }

    const selectedCategory = categories[index]
    const cmdsInCategory = commandMap[selectedCategory]

    let cmdText = `
╭━───❰ ${selectedCategory} ❱───━╮
`

    cmdsInCategory.forEach((c, i) => {
      cmdText += `
╭─❍ ${i + 1}
│ ✧ COMMAND : ${c.pattern}
│ ✧ INFO    : ${c.desc || "No description"}
╰───────────────❍
`
    })

    cmdText += `
╭━━━━━━━━━━━━━━━━━━╮
│ 🌸 Total Commands : ${cmdsInCategory.length}
╰━━━━━━━━━━━━━━━━━━╯
`

    await client.sendMessage(from, {
      image: { url: headerImage },
      caption: cmdText
    }, { quoted: m })

  } catch (err) {
    console.log(err)
    await client.sendMessage(from, { text: "❌ Error occurred!" })
  }

})