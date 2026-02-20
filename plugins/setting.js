const { cmd, commands } = require('../command');
const { sendInteractiveMessage } = require('gifted-btns');

cmd({
  pattern: "settings",
  react: "⚙️",
  desc: "Open bot settings",
  category: "setting",
  premium: true,  
  fromMe: true,   
  async handler({ sock, jid, msg }) {

    // Menu content
    const menuData = {
      title: "Settings Menu",
      sections: [
        {
          title: "𝐒𝐄𝐓𝐓𝐈𝐍𝐆",
          rows: [
            { id: ".antidelete on", title: "AntiDelete on ⚠", description: "Enable💐" },
            { id: ".antidelete off", title: "Antidelete off ⚠", description : "Deseble 💐" }
          ]
        }
      ]
    };

    // Send interactive menu
    await sendInteractiveMessage(sock, jid, {
      text: "Choose one item",
      interactiveButtons: [
        { name: "single_select", buttonParamsJson: JSON.stringify(menuData) }
      ]
    });
  }
});

// Handler for menu selection
sock.ev.on("interactive_response", async (res) => {
  try {
    const { id, from } = res; // id = selected row id
    if (!from || !id) return;

    if (id === "antidelete") {
      await sock.sendMessage(from, { text: "✅ AntiDelete has been enabled!" });
      // here you can also call your anti-delete function
    }

    if (id === "restart") {
      await sock.sendMessage(from, { text: "Anti delete off" });
      // here you can call your restart function
    }

  } catch (err) {
    console.error(err);
  }
});