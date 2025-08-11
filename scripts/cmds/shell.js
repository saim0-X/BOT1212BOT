const { exec } = require('child_process');

const owners = ["61578227875446", "100051869042398"];
const maxOutputLength = 4000; // Limit output to avoid message errors

module.exports = {
  config: {
    name: "shell",
    version: "1.0",
    author: "Samir editor by Fahad Islam",
    countDown: 5,
    role: 0,
    shortDescription: "Execute shell commands (owner only)",
    longDescription: "Run terminal commands directly from Messenger. Owner only.",
    category: "system",
    guide: {
      vi: "{p}{n} <lệnh>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message, event, api }) {
    const senderID = event.senderID;

    // 🔒 Owner-only access check
    if (!owners.includes(senderID)) {
      return api.sendMessage(
        "❌ | You are not authorized to use this command.",
        event.threadID,
        event.messageID
      );
    }

    const command = args.join(" ");
    if (!command) {
      return message.reply("⚠️ | Please enter a command to execute.");
    }

    // 🚀 Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return message.reply(`❌ | Execution error:\n${error.message}`);
      }

      if (stderr) {
        return message.reply(`⚠️ | Stderr:\n${stderr}`);
      }

      const output = stdout || "✅ | Command executed with no output.";

      // ✂️ Handle large outputs
      if (output.length > maxOutputLength) {
        return message.reply("📄 | Output too long. Sending as file is recommended.");
      }

      return message.reply(`✅ | Output:\n${output}`);
    });
  }
};
