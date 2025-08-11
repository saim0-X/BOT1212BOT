const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const axios = require("axios");

module.exports = {
  config: {
    name: "spy",
    version: "3.6",
    author: "Fahad Islam",
    role: 0,
    countDown: 10,
    description: "Spy card with animated hex grid and glowing profile",
    category: "information"
  },

  onStart: async function ({ event, api, args, usersData }) {
    const uidSelf = event.senderID;
    const uidMentioned = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid = event.type === "message_reply"
        ? event.messageReply.senderID
        : uidMentioned || uidSelf;
    }

    let userInfo, user;
    try {
      userInfo = await api.getUserInfo(uid);
      user = userInfo[uid];
    } catch {
      return api.sendMessage("❌ Failed to fetch user info.", event.threadID);
    }

    const avatarUrl = await usersData.getAvatarUrl(uid);
    const userName = user.name || "Unknown";
    const gender = user.gender === 1 ? "👧 Girl" : user.gender === 2 ? "👦 Boy" : "🌀 Undefined";
    const role = user.type?.toUpperCase() || "Normal User";
    const userData = await usersData.get(uid);
    const allUser = await usersData.getAll();
    const money = userData.money || 0;
    const exp = userData.exp || 0;

    const rank = allUser.slice().sort((a, b) => b.exp - a.exp).findIndex(u => u.userID === uid) + 1;
    const moneyRank = allUser.slice().sort((a, b) => b.money - a.money).findIndex(u => u.userID === uid) + 1;

    // Baby teach system
    let babyTeach = 0;
    try {
      const res = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
      const baseApi = res.data.api;
      const babyRes = await axios.get(`${baseApi}/baby?list=all`);
      const babyList = babyRes.data?.teacher?.teacherList || [];
      babyTeach = babyList.find(t => t[uid])?.[uid] || 0;
    } catch {}

    const encoder = new GIFEncoder(600, 300);
    const tmpPath = path.join(__dirname, `spy_flicker_${uid}.gif`);
    const stream = fs.createWriteStream(tmpPath);
    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(120);
    encoder.setQuality(10);

    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext("2d");

    let avatarImage;
    try {
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      avatarImage = await loadImage(Buffer.from(response.data, "binary"));
    } catch {
      avatarImage = null;
    }

    const level = Math.floor((1 + Math.sqrt(1 + 8 * exp / 5)) / 2);
    const nextExp = 5 * ((level + 1) * level) / 2;
    const progress = Math.min(exp / nextExp, 1);

    function drawHex(ctx, x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const x_i = x + size * Math.cos(angle);
        const y_i = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x_i, y_i);
        else ctx.lineTo(x_i, y_i);
      }
      ctx.closePath();
      ctx.stroke();
    }

    function drawHexPattern(ctx, flicker) {
      const hexSize = 20;
      const hexHeight = Math.sqrt(3) * hexSize;
      const rows = 300 / hexHeight + 1;
      const cols = 600 / (1.5 * hexSize) + 1;

      ctx.strokeStyle = `rgba(0,255,255,${flicker})`;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * 1.5 * hexSize;
          const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
          drawHex(ctx, x, y, hexSize);
        }
      }
    }

    for (let i = 0; i < 10; i++) {
      const flicker = (Math.random() * 0.15 + 0.05).toFixed(2);

      ctx.fillStyle = "#000022";
      ctx.fillRect(0, 0, 600, 300);
      drawHexPattern(ctx, flicker);

      if (avatarImage) {
        ctx.save();
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 20 + (i % 2) * 10;
        ctx.beginPath();
        ctx.arc(75, 75, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, 25, 25, 100, 100);
        ctx.restore();
      }

      ctx.font = "bold 20px DejaVu Sans";
      ctx.fillStyle = "white";
      ctx.fillText(`👤 Name: ${userName}`, 150, 50);
      ctx.fillText(`🆔 UID: ${uid}`, 150, 80);
      ctx.fillText(`⚧ Gender: ${gender}`, 150, 110);
      ctx.fillText(`🧭 Role: ${role}`, 150, 140);
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`💰 Money: $${formatMoney(money)}`, 150, 170);
      ctx.fillStyle = "#00ff99";
      ctx.fillText(`📈 Rank: #${rank}/${allUser.length}`, 150, 200);
      ctx.fillStyle = "gold";
      ctx.fillText(`💸 Money Rank: #${moneyRank}/${allUser.length}`, 150, 230);
      ctx.fillStyle = "violet";
      ctx.fillText(`👶 Baby Teach: ${babyTeach}`, 150, 260);

      ctx.fillStyle = "#222";
      ctx.fillRect(150, 275, 300, 10);
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(150, 275, 300 * progress, 10);
      ctx.strokeStyle = "white";
      ctx.strokeRect(150, 275, 300, 10);
      ctx.fillText(`Lv. ${level}`, 470, 288);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    stream.on("finish", () => {
      api.sendMessage({
        body: ``,
        attachment: fs.createReadStream(tmpPath)
      }, event.threadID, () => fs.unlinkSync(tmpPath));
    });
  }
};

function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}
