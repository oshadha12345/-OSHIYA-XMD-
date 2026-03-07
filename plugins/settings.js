const { cmd } = require('../command')
const config = require('../config')

cmd({
    pattern: "AUTO_STATUS_SEND",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {

if (!isOwner) return reply("Owner only command")

if (!args[0]) return reply("Use true or false")

let value = args[0].toLowerCase()

if (value === "true") {
    config.AUTO_STATUS_SEND = true
} else if (value === "false") {
    config.AUTO_STATUS_SEND = false
} else {
    return reply("Use true or false")
}

reply(`AUTO_STATUS_SEND changed to ${config.AUTO_STATUS_SEND}`)
})

cmd({
    pattern: "AUTO_STATUS_SEEN",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {

if (!isOwner) return reply("Owner only command")

if (!args[0]) return reply("Use true or false")

let value = args[0].toLowerCase()

if (value === "true") {
    config.AUTO_STATUS_SEEN = true
} else if (value === "false") {
    config.AUTO_STATUS_SEEN = false
} else {
    return reply("Use true or false")
}

reply(`AUTO_STATUS_SEEN changed to ${config.AUTO_STATUS_SEEN}`)
})

cmd({
    pattern: "AUTO_STATUS_REACT",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {

if (!isOwner) return reply("Owner only command")

if (!args[0]) return reply("Use true or false")

let value = args[0].toLowerCase()

if (value === "true") {
    config.AUTO_STATUS_REACT = true
} else if (value === "false") {
    config.AUTO_STATUS_REACT = false
} else {
    return reply("Use true or false")
}

reply(`AUTO_STATUS_REACT changed to ${config.AUTO_STATUS_REACT}`)
})
