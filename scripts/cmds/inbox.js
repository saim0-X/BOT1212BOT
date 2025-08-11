module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "system"
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
      if (this.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }

      const query = encodeURIComponent(args.join(' '));
      message.reply("𝙝𝙞 𝙞𝙣𝙗𝙤𝙭 𝙬𝟴 𝙗𝙖𝙗𝙮 🦆🎀", event.threadID);
      api.sendMessage("𝘼𝙨𝙨𝙖𝙡𝙖𝙢𝙪𝙖𝙡𝙖𝙞𝙠𝙪𝙢 🦆🖤", event.senderID);
    } catch (error) {
      console.error("error baby: " + error);
    }
  }
};
