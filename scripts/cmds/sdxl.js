const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "sdxl",
    aliases: [],
    version: "1.0",
    author: "nexo_here",
    countDown: 10,
    role: 0,
    shortDescription: "Generate image with SDXL Light",
    longDescription: "Generate AI image using SDXL Light API with various styles",
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    guide: {
      en: "{pn} <prompt> | <style>\n\nAvailable styles:\n- 3D Model\n- Analog Film\n- Anime\n- Cinematic\n- Comic Book"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").split("|");
    const prompt = input[0]?.trim();
    const style = input[1]?.trim();

    if (!prompt || !style) {
      return api.sendMessage("❌ | Please provide both prompt and style.\nExample:\n.sdxllight a dragon flying over a city | Anime", event.threadID, event.messageID);
    }

    const validStyles = ["3D Model", "Analog Film", "Anime", "Cinematic", "Comic Book"];
    if (!validStyles.includes(style)) {
      return api.sendMessage("❌ | Invalid style provided. Available styles:\n- " + validStyles.join("\n- "), event.threadID, event.messageID);
    }

    const msg = await api.sendMessage("⏳ | Generating image...", event.threadID);

    try {
      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/sdxl-light",
        params: {
          prompt: prompt,
          style: style,
          model: "sdxl"
        },
        responseType: "arraybuffer"
      });

      const path = __dirname + `/cache/sdxllight_${event.senderID}.png`;
      fs.writeFileSync(path, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `✅ | Here's your image:\nPrompt: ${prompt}\nStyle: ${style}`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), msg.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | Failed to generate image. Please try again later.", event.threadID, msg.messageID);
    }
  }
};
