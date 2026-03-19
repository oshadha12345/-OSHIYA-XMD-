const { collection } = require("../lib/db");
const { cmd, commands } = require('../command');

module.exports = {
    name: "config",
    desc: "Change config live",

    async execute(m, { args, reply, isOwner }) {

        if (!isOwner) return reply("Owner only ❌");

        const [key, state] = args;

        if (!key || !state) return reply("Example:\n.config AUTO_TYPING on");

        const value = state === "on";

        await collection.updateOne(
            { key: "config" },
            { $set: { [key]: value } }
        );

        reply(`✅ ${key} → ${value ? "ON" : "OFF"}`);
    }
};
