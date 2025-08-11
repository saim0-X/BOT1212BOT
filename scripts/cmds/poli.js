const axios = require("axios");

module.exports = {
  config: {
    name: "poli",
    aliases: ["poligen", "politeimg"],
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    role: 0,
    shortDescription: "🎨 Generate polite-style AI art from text",
    longDescription: "Generate an elegant, polite-tone AI image from your description using CatX Poli image generator.",
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    guide: {
      en: "{pn} <prompt>\n\nExample:\n{pn} A cat wearing a tuxedo"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ Please provide a prompt to generate the image.\n\nExample:\n{pn} A peaceful fox in a flower garden");
    }

    const apiURL = `https://mmr-cat-x-api.onrender.com/api/poli?text=${encodeURIComponent(prompt)}`;

    let loading;
    try {
      // Send "loading" message
      loading = await message.reply("🎨 Politely painting your idea... Please wait. 🧠🖌️");

      // Fetch the image stream
      const response = await axios.get(apiURL, { responseType: "stream" });

      // Send the final image
      await message.reply({
        body: `✅ Your polite AI art is ready! 🌸\nPrompt: "${prompt}"\n\n✨ API: CatX-POLI\n👨‍💻 Dev: Mueid Mursalin Rifat`,
        attachment: response.data
      });

    } catch (err) {
      console.error("❌ Poli API Error:", err.message);
      message.reply("🚫 Failed to generate image. Please try again shortly.");
    }

    // Remove loading message
    if (loading?.messageID) {
      message.unsend(loading.messageID);
    }
  }
};
