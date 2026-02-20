// plugins/owner.js
const { Client } = require('@neoxr/wb');
const { cmd } = require("../command");

module.exports = (client) => {
    client.onMessage(async (message) => {
        const chatId = message.chat;
        const text = message.body;

        if (text === '.owner') {
            await client.sendContact(chatId, [
                {
                    name: 'OSHIYA',
                    number: '94756599952',
                    about: 'Owner & Creator'
                }
            ]);
        }
    });
};