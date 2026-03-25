const { commands } = require('../command');

commands({
    pattern: "test",
    alias: ["panel", "help"],
    react: "📑",
    category: "main",
    filename: __filename
},
async (test, mek, m, { from, pushname, prefix, reply }) => {
    try {
        // මෙතන තමා Buttons ටික define කරන්නේ
        const buttons = [
            { buttonId: `${prefix}ping`, buttonText: { displayText: 'Speed ⚡' }, type: 1 },
            { buttonId: `${prefix}owner`, buttonText: { displayText: 'Owner 👤' }, type: 1 },
            { buttonId: `${prefix}menu`, buttonText: { displayText: 'Runtime ⏳' }, type: 1 }
        ];

        const buttonMessage = {
            image: { url: `https://raw.githubusercontent.com/oshadha12345/images/main/20251222_040815.jpg` },
            caption: `வணக்கம் ${pushname}!\n\nමෙය OSHIYA-MD V1 මෙනුවයි. ඔබට අවශ්‍ය දේ තෝරන්න.`,
            footer: '© Powered by Oshiya Botz',
            buttons: buttons,
            headerType: 4
        };

        // Message එක යැවීම
        await test.sendMessage(from, buttonMessage, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("බොත්තම් පද්ධතියේ දෝෂයකි!");
    }
});
