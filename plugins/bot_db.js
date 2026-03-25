const mongoose = require("mongoose");
const config = require("../config");

// --- ⚙️ MONGODB URI SETTINGS ---
const MONGO_URI = "mongodb+srv://oshadhaoshadha12345_db_user:SH0m8ksHl8A0ZfBF@oshiya.bc9b5e4.mongodb.net/?appName=Oshiya";

const SettingsSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    ownerName: { type: String, default: config.OWNER_NAME },
    prefix: { type: String, default: config.DEFAULT_PREFIX },
    mode: { type: String, default: "public" }, // 04
    password: { type: String, default: "not_set" }, // 05
    botImage: { type: String, default: "null" },    // 06
    autoStatusSeen: { type: String, default: "true" }, // 10
    autoStatusReact: { type: String, default: "true" }
});

const AutoReplySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    trigger: { type: String, required: true, lowercase: true },
    chat_reply: { type: String, required: true },
});

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
const AutoReply = mongoose.models.AutoReply || mongoose.model("AutoReply", AutoReplySchema);

const settingsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 100,
            minPoolSize: 10,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ MongoDB Connected Successfully with Auto-Voice Support!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
}

const cleanId = (jid) => jid ? jid.split("@")[0].replace(/[^0-9]/g, "") : null;

async function getBotSettings(userNumber) {
    const targetId = cleanId(userNumber);
    if (!targetId) return null;
    if (settingsCache.has(targetId)) return settingsCache.get(targetId);

    try {
        let settings = await Settings.findOne({ id: targetId }).lean();
        if (!settings) {
            settings = await Settings.create({ id: targetId });
            settings = settings.toObject ? settings.toObject() : settings;
        }
        settingsCache.set(targetId, settings);
        setTimeout(() => settingsCache.delete(targetId), CACHE_TTL);
        return settings;
    } catch (e) {
        console.error("❌ Error fetching settings:", e);
        return null;
    }
}

async function updateSetting(userNumber, keyOrObject, value = null) {
    try {
        const targetId = cleanId(userNumber);
        let updateData = (typeof keyOrObject === "object") ? keyOrObject : { [keyOrObject]: value };
        const result = await Settings.findOneAndUpdate({ id: targetId }, { $set: updateData }, { new: true, upsert: true, lean: true });
        if (result) settingsCache.set(targetId, result);
        return !!result;
    } catch (e) {
        console.error("❌ Error updating setting:", e);
        return false;
    }
}

async function getAutoReply(userNumber, text) {
    try {
        const targetId = cleanId(userNumber);
        const settings = await getBotSettings(targetId);
        if (!settings || settings.autoReply !== "true") return null;
        const reply = await AutoReply.findOne({ userId: targetId, trigger: text.toLowerCase().trim() }).lean();
        return reply ? reply.chat_reply : null;
    } catch (e) {
        console.error("❌ Error fetching auto reply:", e);
        return null;
    }
}

module.exports = { connectDB, getBotSettings, updateSetting, getAutoReply, AutoReply, Settings };
