const fs = require("fs-extra");
const path = require("path");

const config = global.GoatBot.config;
const { client } = global;

module.exports = {
  config: {
    name: "vip",
    version: "1.2",
    author: "Fahad Islam",
    role: 2,
    shortDescription: "Manage VIP members & VIP mode",
    category: "admin",
    guide: {
      en: "{p}vip add <uid|@mention>\n{p}vip remove <uid|@mention>\n{p}vip list\n{p}vip on\n{p}vip off"
    }
  },

  langs: {
    en: {
      noAdmin: "❌ You are not an admin.",
      vipAdded: "✅ Added to VIP list.",
      vipRemoved: "✅ Removed from VIP list.",
      vipModeEnabled: "🟢 VIP mode enabled.",
      vipModeDisabled: "🔴 VIP mode disabled.",
      noVipMembers: "No VIP members yet.",
      vipListTitle: "VIP Members list:"
    }
  },

  onStart: async function ({ message, event, args, getLang, usersData }) {
    const vipDataPath = path.join(__dirname, "vip.json");
    const { senderID } = event;

    if (!config.adminBot.includes(senderID)) {
      return message.reply(getLang("noAdmin"));
    }

    let vipData = await fs.readJSON(vipDataPath).catch(() => ({ permission: [] }));
    if (!Array.isArray(vipData.permission)) vipData.permission = [];

    const action = args[0]?.toLowerCase();

    if (action === "add") {
      let uid;
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (args[1]) {
        uid = args[1];
      }
      if (!uid) return message.reply("Please mention or provide a UID to add.");

      if (!vipData.permission.includes(uid)) {
        vipData.permission.push(uid);
        await fs.writeJSON(vipDataPath, vipData, { spaces: 2 });
        return message.reply(getLang("vipAdded"));
      } else {
        return message.reply("User is already in the VIP list.");
      }

    } else if (action === "remove") {
      let uid;
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (args[1]) {
        uid = args[1];
      }
      if (!uid) return message.reply("Please mention or provide a UID to remove.");

      if (vipData.permission.includes(uid)) {
        vipData.permission = vipData.permission.filter(id => id !== uid);
        await fs.writeJSON(vipDataPath, vipData, { spaces: 2 });
        return message.reply(getLang("vipRemoved"));
      } else {
        return message.reply("User is not in the VIP list.");
      }

    } else if (action === "list") {
      if (vipData.permission.length === 0) {
        return message.reply(getLang("noVipMembers"));
      }
      let list = "";
      for (const id of vipData.permission) {
        let name = "Unknown";
        if (usersData && typeof usersData.getName === "function") {
          try {
            name = await usersData.getName(id);
          } catch {}
        }
        list += `${id} - (${name})\n`;
      }
      return message.reply(`${getLang("vipListTitle")}\n${list}`);

    } else if (action === "on") {
      try {
        config.whiteListMode.enable = true;
        config.whiteListMode.whiteListIds = vipData.permission;
        await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("vipModeEnabled"));
      } catch (error) {
        console.error("Error enabling VIP mode:", error);
        return message.reply("An error occurred while enabling VIP mode.");
      }

    } else if (action === "off") {
      try {
        config.whiteListMode.enable = false;
        await fs.writeFile(client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("vipModeDisabled"));
      } catch (error) {
        console.error("Error disabling VIP mode:", error);
        return message.reply("An error occurred while disabling VIP mode.");
      }
    } else {
      return message.reply(getLang("guide", this.config.guide.en));
    }
  }
};
