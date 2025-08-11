const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "art",
    version: "1.0",
    author: "Fahad Islam",
    description: "Generate AI art from a prompt using xnil.art API",
    usage: "[prompt]",
    role: 0,
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    cooldown: 5
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt to generate art.\nExample: art cat in space", event.threadID, event.messageID);

    const imgUrl = `https://xnil.xnil.work.gd/xnil/art?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(imgUrl, { responseType: "stream" });
      const filePath = path.join(__dirname, "cache", `art_${event.senderID}.png`);

      await fs.ensureDir(path.dirname(filePath));
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);
      writer.on("finish", () => {
        api.sendMessage({
          body: `🎨 Art generated for:\n"${prompt}"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", (err) => {
        console.error("File stream error:", err);
        api.sendMessage("❌ Failed to save the image.", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error("Image generation failed:", error);
      api.sendMessage("❌ Failed to generate image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
