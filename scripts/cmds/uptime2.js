const fs = require("fs");
const os = require("os");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["up2", "upt2"],
    version: "3.0",
    author: "nexo_here + Fahad Islam",
    cooldowns: 5,
    role: 0,
    shortDescription: "Bot's system status",
    longDescription: "Show system info: uptime, RAM, CPU, load, platform etc",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const width = 1400;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#0d1a22");
    bgGradient.addColorStop(1, "#091015");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Card with glow
    const cardX = 70, cardY = 70;
    const cardWidth = width - 140, cardHeight = height - 140;
    drawGlassCard(ctx, cardX, cardY, cardWidth, cardHeight, 30);

    // Title
    ctx.font = "bold 58px 'Segoe UI'";
    const titleGradient = ctx.createLinearGradient(cardX, cardY, cardX + 500, cardY);
    titleGradient.addColorStop(0, "#00ffaa");
    titleGradient.addColorStop(1, "#00cc88");
    ctx.fillStyle = titleGradient;
    ctx.shadowColor = "#00ffaa88";
    ctx.shadowBlur = 20;
    ctx.fillText("Ichigo AI – System Monitor", cardX + 50, cardY + 50);
    ctx.shadowBlur = 0;

    // Divider
    ctx.strokeStyle = "#00ffaa22";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 120);
    ctx.lineTo(cardX + cardWidth - 50, cardY + 120);
    ctx.stroke();

    // System Info
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const botUptime = `${d}d ${h}h ${m}m ${s}s`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg()[0];
    const cpuPercent = Math.min((loadAvg / cpuCount) * 100, 100);

    const nodeVer = process.version;
    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();

    // Draw info lines
    const infoStartY = cardY + 150;
    const spacing = 60;
    const drawLine = (label, value, index) => {
      const y = infoStartY + index * spacing;
      ctx.fillStyle = "#00ffaa";
      ctx.font = "bold 30px 'Segoe UI'";
      ctx.fillText(label, cardX + 60, y);
      ctx.fillStyle = "#ffffffcc";
      ctx.font = "28px 'Segoe UI'";
      ctx.fillText(value, cardX + 350, y);
    };

    drawLine("⏱️ Uptime", botUptime, 0);
    drawLine("🧠 CPU", `${cpuModel} (${cpuCount} cores)`, 1);
    drawLine("📈 Load Avg", `${loadAvg.toFixed(2)} (${cpuPercent.toFixed(1)}%)`, 2);
    drawLine("💾 RAM", `${(usedMem / 1024 / 1024).toFixed(1)} MB / ${(totalMem / 1024 / 1024).toFixed(1)} MB (${ramUsagePercent.toFixed(1)}%)`, 3);
    drawLine("🛠️ Platform", `${platform} (${arch})`, 4);
    drawLine("📦 Node", nodeVer, 5);
    drawLine("🔖 Host", hostname, 6);

    // RAM and CPU bars
    drawProgressBar(ctx, cardX + 60, infoStartY + 7 * spacing + 40, cardWidth - 120, 40, ramUsagePercent, "RAM Usage", "#00ffaa", "#003322");
    drawProgressBar(ctx, cardX + 60, infoStartY + 7 * spacing + 120, cardWidth - 120, 40, cpuPercent, "CPU Load", "#ffaa00", "#332200");

    // Timestamp
    ctx.font = "italic 22px 'Segoe UI'";
    ctx.fillStyle = "#77ffd2";
    ctx.fillText(`⏰ Generated: ${new Date().toLocaleString()}`, cardX + 60, height - 50);

    // Save image
    const buffer = canvas.toBuffer("image/png");
    const fileName = "uptime_report_ichigo_pro.png";
    fs.writeFileSync(fileName, buffer);

    // Send only the image
    message.reply({
      attachment: fs.createReadStream(fileName)
    });
  }
};

function drawGlassCard(ctx, x, y, w, h, r) {
  ctx.shadowColor = "#00ffaa33";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, x, y, w, h, r, true, false);
  ctx.shadowBlur = 0;
}

function drawProgressBar(ctx, x, y, w, h, percent, label, fillColor, bgColor) {
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, 20, true, false);

  const fillW = (percent / 100) * w;
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, fillColor);
  grad.addColorStop(1, "#003322");
  ctx.fillStyle = grad;
  ctx.shadowColor = fillColor + "66";
  ctx.shadowBlur = 20;
  roundRect(ctx, x, y, fillW, h, 20, true, false);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffffcc";
  ctx.font = "bold 24px 'Segoe UI'";
  ctx.fillText(`${label}: ${percent.toFixed(1)}%`, x + 20, y + h / 2 + 6);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
  }
