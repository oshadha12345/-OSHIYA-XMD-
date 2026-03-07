const { cmd } = require('../command')
const fs = require('fs')
const path = require('path')
const config = require('../config')

// Path to config.js
const configFile = path.join(__dirname, '../config.js')

// Function to save updated config to file
function saveConfig() {
    fs.writeFileSync(configFile, 'module.exports = ' + JSON.stringify(config, null, 4))
}

// Generic handler for AUTO_STATUS commands
cmd({
    pattern: "AUTO_STATUS_(SEND|SEEN|REACT)",
    react: "💥",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("Owner only command")
    if (!args[0]) return reply("Use true or false")

    // Extract type: SEND, SEEN, REACT
    let type = m.text.match(/AUTO_STATUS_(SEND|SEEN|REACT)/)[1]

    // Validate argument
    let value = args[0].toLowerCase()
    if (value !== "true" && value !== "false") return reply("Use true or false")

    // Update config
    config[`AUTO_STATUS_${type}`] = value === "true"
    saveConfig() // Save to config.js

    // Optional: apply immediately if your bot supports these
    if (conn && conn.setAutoStatus) {
        switch (type) {
            case "SEND":
                conn.setAutoStatus?.(config.AUTO_STATUS_SEND)
                break
            case "SEEN":
                conn.setAutoSeen?.(config.AUTO_STATUS_SEEN)
                break
            case "REACT":
                conn.setAutoReact?.(config.AUTO_STATUS_REACT)
                break
        }
    }

    reply(`AUTO_STATUS_${type} changed to ${config[`AUTO_STATUS_${type}`]}`)
})
