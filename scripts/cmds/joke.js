const axios = require("axios");

module.exports = {
  config: {
    name: "joke",
    aliases: ["funjoke", "joke"],
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    role: 0,
    shortDescription: "😂 Get a random joke",
    longDescription: "Fetches a random joke (setup + punchline) from the CatX Joke API to make you laugh.",
    category: "fun",
    guide: {
      en: "{pn}\n\nExample:\n{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://mmr-cat-x-api.onrender.com/api/joke");
      const joke = res?.data?.joke;

      if (!joke?.setup || !joke?.punchline) {
        return message.reply("😕 Couldn't fetch a joke right now. Try again later!");
      }

      message.reply(`😃 ${joke.setup}\n\n😀 ${joke.punchline}`);
    } catch (err) {
      console.error("❌ Joke API Error:", err.message);
      message.reply("🚫 Failed to get a joke. Please try again soon.");
    }
  }
};
