const { createCanvas } = require("canvas");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");

const birthYearEvents = {
  2005: [
    "YouTube was launched",
    "Facebook became public",
    "Hurricane Katrina hit the US",
    "Batman Begins was released"
  ],
  2000: ["Y2K bug panic", "Sydney Olympics", "First camera phone released"],
  2010: ["Instagram launched", "Burj Khalifa opened", "iPad released"]
};

module.exports = {
  config: {
    name: "age",
    aliases: ["agecalc", "boyosh"],
    version: "3.5",
    author: "Ew'r Saim",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Stylish image age card" },
    longDescription: { en: "Generate full milestone age summary in image format" },
    category: "utility",
    guide: { en: "{pn} YYYY-MM-DD" }
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) {
      return message.reply("⚠️ Please provide your birth date!\nExample: `/age 2005-08-15`");
    }

    const birthDate = moment.tz(args[0], "YYYY-MM-DD", true, "Asia/Dhaka");
    if (!birthDate.isValid()) {
      return message.reply("❌ Invalid date format! Use: `YYYY-MM-DD`");
    }

    const now = moment().tz("Asia/Dhaka");

    const years = now.diff(birthDate, "years");
    const months = now.diff(birthDate.clone().add(years, "years"), "months");
    const days = now.diff(birthDate.clone().add(years, "years").add(months, "months"), "days");

    const totalDays = now.diff(birthDate, "days");
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = now.diff(birthDate, "months");
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    const nextBirthday = birthDate.clone().year(now.year());
    if (nextBirthday.isBefore(now)) nextBirthday.add(1, "year");
    const daysUntilBirthday = nextBirthday.diff(now, "days");

    const lastBirthday = nextBirthday.clone().subtract(1, "year");
    const sinceLastBirthday = now.diff(lastBirthday, "days");

    const lifespanPercent = Math.min(100, ((totalDays / (70 * 365)) * 100).toFixed(1));
    const barBlocks = Math.round((lifespanPercent / 100) * 20);
    const progressBar = "█".repeat(barBlocks) + "▁".repeat(20 - barBlocks);

    const width = 1000;
    const height = 850;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 🌌 Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0a0f3c");
    gradient.addColorStop(1, "#3a0057");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ❄️ Glowing purple snow
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 200, 255, 0.25)";
      ctx.shadowColor = "#ffccff";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 🟣 Rounded neon frame
    drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 25, "#aa00ff");

    // 📝 Text layout
    let y = 80;
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#aa00ff";
    ctx.shadowBlur = 12;
    ctx.fillText("🎂 AGE CARD", 400, y);
    ctx.shadowBlur = 0;

    y += 60;
    ctx.font = "22px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`📅 Birth Date: ${birthDate.format("dddd, D MMMM YYYY")}`, 60, y);
    y += 35;
    ctx.fillText(`📍 Today: ${now.format("dddd, D MMMM YYYY")}`, 60, y);

    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText("🧮 Your Age:", 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`⇨ ${years} years   ⇨ ${months} months   ⇨ ${days} days`, 80, y);

    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText("📆 Total Time Lived:", 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`• ${totalMonths} months • ${totalWeeks} weeks • ${totalDays} days`, 80, y);
    y += 30;
    ctx.fillText(`• ~${totalHours.toLocaleString()} hrs • ${totalMinutes.toLocaleString()} mins`, 80, y);
    y += 30;
    ctx.fillText(`• ~${totalSeconds.toLocaleString()} sec`, 80, y);

    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText("⏳ Since Last Birthday:", 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`• ${Math.floor(sinceLastBirthday / 30)} months • ${sinceLastBirthday % 30} days`, 80, y);

    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText("🎉 Until Next Birthday:", 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`• ${daysUntilBirthday} days left`, 80, y);

    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText("📊 Lifespan Progress (70 years):", 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${progressBar} ${lifespanPercent}%`, 80, y);

    // 📜 Events
    const events = birthYearEvents[birthDate.year()] || ["No events available"];
    y += 50;
    ctx.fillStyle = "#00ffff";
    ctx.fillText(`📜 Events From ${birthDate.year()}:`, 60, y);
    y += 30;
    ctx.fillStyle = "#ffffff";
    for (const e of events.slice(0, 3)) {
      ctx.fillText(`• ${e}`, 80, y);
      y += 25;
    }

    // 💾 Save Image
    await fs.promises.mkdir(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `age_card_${Date.now()}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    message.reply({
      body: "",
      attachment: fs.createReadStream(filePath)
    }, () => setTimeout(() => fs.unlinkSync(filePath), 30 * 1000));
  }
};

// ⭕ Helper to draw glowing rounded rect
function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.shadowColor = "#ffb3ff";
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;
                                }
