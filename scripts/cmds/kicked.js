const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kicked",
    version: "1.2",
    author: "Ew'r Saim",
    countDown: 5,
    role: 0,
    shortDescription: "Kick someone with haruka sakura style 😈",
    longDescription: "Sends an image showing the user kicking another user",
    category: "funny",
    guide: {
      en: "{pn} @tag"
    }
  },

  langs: {
    en: {
      noTag: "You must tag the person you want to kick."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];

    if (!uid2)
      return message.reply(getLang("noTag"));

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      const [avatar1, avatar2] = await Promise.all([
        loadImage(avatarURL1),
        loadImage(avatarURL2)
      ]);

      const bgURL = "https://i.ibb.co/sdRFrBQG/2-Nm-Kr-SUtr-T.jpg.jpeg";
      const bgBuffer = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
      const bgImg = await loadImage(bgBuffer);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0);

      // Circular crop function
      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // Updated avatar positions
      drawCircle(ctx, avatar1, 500, 90, 90);  // kicker
      drawCircle(ctx, avatar2, 230, 25, 90);  // kicked

      // Save image
      const savePath = path.join(__dirname, "tmp");
      await fs.ensureDir(savePath);
      const imgPath = path.join(savePath, `${uid1}_${uid2}_kick.jpg`);
      await fs.writeFile(imgPath, canvas.toBuffer());

      // ✅ Properly remove mention text
      const mentionTag = event.mentions[uid2];
      const rawText = args.join(" ");
      const cleanedText = rawText.replace(mentionTag, "").trim();

      const finalText = cleanedText || "🦶💢 Your destiny was my foot! Take care, you're out! 😎🔥";

      await message.reply({
        body: finalText,
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlink(imgPath));

    } catch (err) {
      console.error("❌ Kicked command error:", err);
      return message.reply("⚠️ Failed to create kick image.");
    }
  }
};
