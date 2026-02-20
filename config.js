const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~3ZFlAKCK#th5rnnRVT7vOpIqBq_bo7fcoRSpyq41vMQop0ET0v0c",
BOT_OWNER: '94725364886',  // Replace with the owner's phone number
AUTO_STATUS_SEEN: 'false',
AUTO_STATUS_REACT: 'false',



};
