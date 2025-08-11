const axios = require("axios");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/7de4fcde614a88d1e63d8ff60e7c6680bccf194d/font";
const listUrl = `${baseUrl}/list.json`;

module.exports = {
  config: {
    name: "font",
    version: "1.1",
    author: "Ew’r Saim",
    role: 0,
    aliases: ["style"],
    shortDescription: { en: "Convert text into different font styles" },
    longDescription: { en: "Convert given text using one of the font styles" },
    category: "tools",
    guide: { en: "{pn} list\n{pn} [font_number] [text]" }
  },

  onStart: async function({ args, message }) {
    const prefix = global.GoatBot.config.prefix;
    const sub = args[0]?.toLowerCase();

    if (sub === "list") {
      try {
        const { data: previews } = await axios.get(listUrl);
        if (!Array.isArray(previews)) throw new Error("Invalid list.json");

        const header = "✨ Available Font Styles ✨\n━━━━━━━━━━━━━━━━━━━━☆";
        const footer = "━━━━━━━━━━━━━━━━━━━━━☆";
        return message.reply(`${header}\n${previews.join("\n")}\n${footer}`);
      } catch (err) {
        console.error(err);
        return message.reply("❌ | Failed to fetch font list. Try again later.");
      }
    }

    const number = sub;
    const text = args.slice(1).join(" ").trim();

    if (!number || isNaN(number) || number === "list") {
      return message.reply(
        `❌ | Invalid usage!\nUse ${prefix}font list to see options\nor ${prefix}font [number] [text] to convert`
      );
    }

    if (!text) {
      return message.reply(`⚠️ | Please enter the text to convert.`);
    }

    try {
      const { data: mapping } = await axios.get(`${baseUrl}/${number}.json`);
      if (!mapping || typeof mapping !== "object") throw new Error("Bad font map");

      const converted = text.split("").map(ch => mapping[ch] || ch).join("");
      return message.reply(converted);
    } catch (err) {
      console.error(err);
      return message.reply(`❌ | Failed to load font #${number}. Maybe it's unavailable.`);
    }
  }
};
