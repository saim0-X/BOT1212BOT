const apiUrl = "https://rexy-apis.onrender.com";

module.exports = {
  config: {
    name: "edit2",
    aliases: ["e2"],
    version: "1.6.9",
    author: "Rexy",
    role: 0,
    description: "Edit image by URL or reply",
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    countDown: 9,
    guide: { en: "{pn} [url] [prompt] or reply to image & prompt" }
  },

  onStart: async ({ message, event, args }) => {
    let imgUrl, prompt = "";

    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ");
    }

    if (!imgUrl && args[0]) {
      imgUrl = args[0];
      prompt = args.slice(1).join(" ");
    }

    if (!imgUrl) {
      return message.reply("• Reply to an image or provide image URL!\n• Add Prompt (for edit)");
    }

    message.reaction('⏳', event.messageID);
    const wm = await message.reply("⏳ Editing your image... Please wait!");

    try {
      const res = await require('axios').get(
        `${apiUrl}/api/edit?imgUrl=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`,
        { responseType: "stream" }
      );

      message.reaction('✅', event.messageID);
      await message.unsend(wm.messageID);
      message.reply({ body: `✅ Here's your Edited image!`, attachment: res.data });

    } catch (error) {
      message.reaction('❌', event.messageID);
      await message.unsend(wm.messageID);
      message.reply(`Error: ${error.message}`);
    }
  }
};
