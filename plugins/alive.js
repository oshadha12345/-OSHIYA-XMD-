const { cmd } = require('../command');
const config = require('../config');
const { sendButtons } = require('gifted-btns');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (danuwamd, mek, m, {
    from, reply
}) => {
    try {

        await sendButtons(danuwamd, from, {
            image: { url: config.ALIVE_IMG }, // make sure image URL is valid
            text: config.ALIVE_MSG || "*I'm Alive Now!* 🤖",
            footer: "Select an option below",
            buttons: [
                {
                    prefix: '.', // ✅ FIXED
                    id: '.ping',
                    text: 'Ping'
                },
                {
                    prefix: '.', // ✅ FIXED
                    id: '.menu',
                    text: 'Menu'
                }
            ]
        });

    } catch (e) {
        console.log("Alive Command Error:", e);
        reply(`Error: ${e.message}`);
    }
});