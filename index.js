const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

/* =========================
   EXPRESS SERVER (Railway fix)
========================= */

const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running");
});

// ⚠️ oluline: kasuta Railway PORT-i
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web server started on port ${PORT}`);
});

/* =========================
   DISCORD BOT
========================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";
let leaderboard = {};

function placementPoints(place) {
  const table = {
    1: 30,
    2: 25,
    3: 22,
    4: 20,
    5: 18
  };
  return table[place] || 0;
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "result") {
    const name = args[0];
    const elims = parseInt(args[1]);
    const place = parseInt(args[2]);

    if (!name || isNaN(elims) || isNaN(place)) {
      return message.reply("Usage: !result name elims placement");
    }

    const points = elims * 2 + placementPoints(place);

    if (!leaderboard[name]) leaderboard[name] = 0;
    leaderboard[name] += points;

    message.channel.send(
      `✅ ${name} earned ${points} points. Total: ${leaderboard[name]}`
    );
  }

  if (command === "leaderboard") {
    if (Object.keys(leaderboard).length === 0) {
      return message.channel.send("No results yet.");
    }

    const sorted = Object.entries(leaderboard)
      .sort((a, b) => b[1] - a[1]);

    let output = "🏆 **Leaderboard**\n\n";

    sorted.forEach((player, index) => {
      output += `${index + 1}. ${player[0]} - ${player[1]} pts\n`;
    });

    message.channel.send(output);
  }
});

client.login(process.env.TOKEN);
