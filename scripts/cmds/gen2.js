const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gen2",
    aliases: ["wgen2"],
    version: "1.2",
    author: "nexo_here",
    countDown: 3,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Generate an image using Weigen AI API with a prompt",
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("⚠️ | Please enter a prompt to generate an image.", event.threadID, event.messageID);

    const msg = await api.sendMessage("🖌️ | Generating image, please wait...", event.threadID);

    try {
      // Make sure cache folder exists
      const cachePath = path.join(__dirname, "../cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const imgPath = path.join(cachePath, `weigen-${Date.now()}.png`);

      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/weigen",
        params: { prompt },
        responseType: "stream"
      });

      const writer = fs.createWriteStream(imgPath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🎨 | Image generated for prompt:\n"${prompt}"`,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath), msg.messageID);
      });

      writer.on("error", err => {
        console.error("❌ Image saving error:", err);
        api.sendMessage("❌ | Failed to save the image.", event.threadID, msg.messageID);
      });

    } catch (err) {
      console.error("❌ Image generation error:", err);
      api.sendMessage("❌ | Failed to generate image. Try again later.", event.threadID, msg.messageID);
    }
  }
};
