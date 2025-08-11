const fs = require("fs-extra");
const path = require("path");
const DIG = require("discord-image-generation"); // Adjust as needed

module.exports = {
  config: {
    name: "slap",
    version: "1.0",
    author: "Fahad Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone's butt with a meme",
    category: "funny",
    guide: {
      en: "{pn} @tag or reply to someone or their image"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2;
    let avatarURL2;

    try {
      // Get sender's avatar URL
      const avatarURL1 = await usersData.getAvatarUrl(uid1);

      // Determine target: tagged user > reply to user > reply to image
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
        avatarURL2 = await usersData.getAvatarUrl(uid2);
      } else if (event.messageReply) {
        const reply = event.messageReply;

        if (reply.senderID && !reply.attachments?.length) {
          uid2 = reply.senderID;
          avatarURL2 = await usersData.getAvatarUrl(uid2);
        } else if (reply.attachments?.length > 0 && reply.attachments[0].type === "photo") {
          avatarURL2 = reply.attachments[0].url;
        }
      }

      if (!avatarURL2) return message.reply(getLang("noTarget"));

      // Generate meme image
      const img = await new DIG.Spank().getImage(avatarURL1, avatarURL2);

      // Ensure tmp directory exists
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      // Save the image temporarily
      const imgPath = path.join(tmpDir, `${uid1}_spank.png`);
      await fs.writeFile(imgPath, img);

      // Use user input as message or fallback to simple default text
      const content = args.join(" ").replace(/<@!?[0-9]+>/g, "").trim();
      const finalMessage = content || "Here's a slap for you!";

      // Send the meme with the message
      await message.reply({
        body: finalMessage,
        attachment: fs.createReadStream(imgPath)
      });

      // Clean up temporary image file
      fs.unlink(imgPath, () => {});

    } catch (error) {
      console.error("Spank Command Error:", error);
      return message.reply(getLang("error"));
    }
  }
};
