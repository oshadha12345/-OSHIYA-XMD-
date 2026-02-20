const { cmd } = require('../command')

cmd({
    pattern: "getdp",
    react: "🎯",
    desc: "Download profile picture of a user.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { from, reply, quoted }) => {
    try {

        // Get target user (quoted or current chat)
        let user = m.quoted ? m.quoted.sender : from

        // Fetch profile picture URL
        let ppUrl
        try {
            ppUrl = await conn.profilePictureUrl(user, 'image')
        } catch {
            return reply("❌ *No Profile Picture Found!*\n\n_This user hasn’t set a DP or it’s private._")
        }

        // Premium Style Caption
        const caption = `
╭━━━〔 🎯 𝙂𝙀𝙏 𝘿𝙋 𝙎𝙐𝘾𝘾𝙀𝙎𝙎 〕━━━╮
┃ 👤 *User:* @${user.split("@")[0]}
┃ 🖼️ *Status:* `Downloaded Successfully`
┃ ⚡ *Quality:* `High Resolution`
╰━━━━━━━━━━━━━━━━━━━━╯
        `

        // Send Profile Picture
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: caption,
            mentions: [user]
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply("❌ *Oops! Something went wrong while fetching the DP.*")
    }
})