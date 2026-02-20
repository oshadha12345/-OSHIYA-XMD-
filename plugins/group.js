const { cmd } = require("../command");
const { getGroupAdmins } = require("../lib/functions");
const { downloadMediaMessage } = require('@rexxhayanasi/elaina-baileys');


// ====== UTILS ======
async function isGroupAdmin(sock, groupJid, userJid) {
  const group = await sock.groupMetadata(groupJid);
  const admins = getGroupAdmins(group.participants);
  return admins.includes(userJid);
}

// ====== COMMANDS ======

// Add member
cmd({
  pattern: "add",
  fromMe: false, // bot owner restriction නැහැ, group admin sufficient
  desc: "Add member (group admin only)",
  category: "group",
  async handler({ sock, mek, args }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender))) 
      return sock.sendMessage(mek.key.remoteJid, { text: "Only group admins can use this command!" });
    if (!args[0]) return sock.sendMessage(mek.key.remoteJid, { text: "Use: .add 947xxxxxxx" });
    try {
      await sock.groupParticipantsUpdate(mek.key.remoteJid, [args[0] + "@s.whatsapp.net"], "add");
      sock.sendMessage(mek.key.remoteJid, { text: `Added ${args[0]}!` });
    } catch (e) {
      sock.sendMessage(mek.key.remoteJid, { text: "Failed to add user!" });
    }
  },
});

// Kick member
cmd({
  pattern: "kick",
  fromMe: false,
  desc: "Kick member (group admin only)",
  category: "group",
  async handler({ sock, mek, quoted, args }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender))) 
      return sock.sendMessage(mek.key.remoteJid, { text: "Only group admins can use this command!" });
    const target = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
    try {
      await sock.groupParticipantsUpdate(mek.key.remoteJid, [target], "remove");
      sock.sendMessage(mek.key.remoteJid, { text: "User removed!" });
    } catch (e) {
      sock.sendMessage(mek.key.remoteJid, { text: "Failed to remove user!" });
    }
  },
});

// Promote member
cmd({
  pattern: "promote",
  fromMe: false,
  desc: "Promote member (group admin only)",
  category: "group",
  async handler({ sock, mek, quoted, args }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only group admins can use this!" });
    const target = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
    await sock.groupParticipantsUpdate(mek.key.remoteJid, [target], "promote");
    sock.sendMessage(mek.key.remoteJid, { text: "Promoted!" });
  },
});

// Demote member
cmd({
  pattern: "demote",
  fromMe: false,
  desc: "Demote member (group admin only)",
  category: "group",
  async handler({ sock, mek, quoted, args }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only group admins can use this!" });
    const target = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
    await sock.groupParticipantsUpdate(mek.key.remoteJid, [target], "demote");
    sock.sendMessage(mek.key.remoteJid, { text: "Demoted!" });
  },
});

// Mute group
cmd({
  pattern: "mute",
  fromMe: false,
  desc: "Mute group (group admin only)",
  category: "group",
  async handler({ sock, mek }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only admins can mute!" });
    await sock.groupSettingUpdate(mek.key.remoteJid, "announcement");
    sock.sendMessage(mek.key.remoteJid, { text: "Group muted!" });
  },
});

// Unmute group
cmd({
  pattern: "unmute",
  fromMe: false,
  desc: "Unmute group (group admin only)",
  category: "group",
  async handler({ sock, mek }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only admins can unmute!" });
    await sock.groupSettingUpdate(mek.key.remoteJid, "not_announcement");
    sock.sendMessage(mek.key.remoteJid, { text: "Group unmuted!" });
  },
});

// Open group
cmd({
  pattern: "open",
  fromMe: false,
  desc: "Open group (group admin only)",
  category: "group",
  async handler({ sock, mek }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only admins can open group!" });
    await sock.groupSettingUpdate(mek.key.remoteJid, "not_announcement");
    sock.sendMessage(mek.key.remoteJid, { text: "Group is now open!" });
  },
});

// Close group
cmd({
  pattern: "close",
  fromMe: false,
  desc: "Close group (group admin only)",
  category: "group",
  async handler({ sock, mek }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only admins can close group!" });
    await sock.groupSettingUpdate(mek.key.remoteJid, "announcement");
    sock.sendMessage(mek.key.remoteJid, { text: "Group is now closed!" });
  },
});

// Tag all members
cmd({
  pattern: "tagall",
  fromMe: false,
  desc: "Mention all members (group admin only)",
  category: "group",
  async handler({ sock, mek }) {
    if (!(await isGroupAdmin(sock, mek.key.remoteJid, mek.sender)))
      return sock.sendMessage(mek.key.remoteJid, { text: "Only admins can tag all!" });
    const group = await sock.groupMetadata(mek.key.remoteJid);
    const mentions = group.participants.map(u => u.id);
    await sock.sendMessage(mek.key.remoteJid, { text: "Hello everyone! 🙌", mentions });
  },
});